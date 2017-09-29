(function($, $$, AlloyTouch, Transform) {
  const Colors = ['rgb(255, 99, 132)', 'rgb(255, 159, 64)', '#fff077', 'rgb(75, 192, 192)', 'rgb(54, 162, 235)', 'rgb(153, 102, 255)', '#515465']
  const Body = $$.querySelector('body')
  const Header = $$.querySelector('#header')
  const Wrapper = $$.getElementById('wrapper')
  const Scroller = $$.querySelector('.items')
  const Items = Scroller.querySelectorAll('.item')
  const DW = $$.body.scrollWidth

  let clearMovingHandler = function() {}
  let touchStartTimestamp = 0
  let touchStartHorizontal = 0
  let current = new Date()

  Transform(Scroller, true)

  changeCurrentNumber()
  changeOtherNumber()

  let alloyTouchHorizontal = new AlloyTouch({
    touch: '#wrapper',
    target: Scroller,
    vertical: false,
    step: 320,
    property: 'translateX',
    min: DW - Scroller.scrollWidth,
    max: 0,
    initialValue: getValue(),
    touchStart: onTouchStart,
    touchMove: function(event) {
      event.stopPropagation()
    },
    touchEnd: onTouchEnd
  })

  let originHeight = DW
  let alloyTouchVertical = new AlloyTouch({
    touch: '#wrapper',
    target: Scroller,
    min: -0.5 * DW,
    max: 0,
    initialValue: 0,
    touchStart: function(event, value) {
      event.stopPropagation()

      originHeight = parseInt(Wrapper.style.height, 10)
      if (isNaN(originHeight)) {
        originHeight = DW
      }
      return false
    },
    touchMove: function(event, value) {
      event.stopPropagation()

      let height = originHeight + value

      if (height > DW || height < 78) {
        return false
      }

      Wrapper.style.height = height + 'px'
      return false
    },
    touchEnd: function(event, value) {
      event.stopPropagation()

      let height = originHeight + value

      if (value > 0 && height > 100) {
        Wrapper.style.height = DW + 'px'
        return false
      }

      if (value < 0 && height < .8 * DW) {
        Wrapper.style.height = '78px'
        return false
      }

      if (height < .5 * DW) {
        Wrapper.style.height = '78px'
      }
      else {
        Wrapper.style.height = DW + 'px'
      }
      return false
    }
  })

  function changeCurrentNumber(index = 0) {
    Items[1].classList.add('changing')
    setHeader()
    setNumber(Items[1], current)
  }

  function changeOtherNumber() {
    setNumber(Items[0], addMonth(current, -1))
    setNumber(Items[2], addMonth(current, 1))

    Items[1].classList.remove('changing')
  }

  function addMonth(date, offset) {
    return moment(date).add(offset, 'months')._d;
  }

  function setHeader() {
    Header.innerHTML = moment(current).format('YYYY年 MM月')
  }

  function setNumber(el, date) {
    if ($.data(el, 'calendar')) {
      $(el).calendar('moveTo', date)
    }
    else {
      $(el).calendar({
        current: date,
        width: DW,
        height: DW,
        onChange: function(date) {
          if (el !== Items[1]) {
            return
          }

          current = date
          setHeader()
          changeOtherNumber()
        }
      });
    }
  }

  function onTouchStart(event, value) {
    event.stopPropagation()

    clearMovingHandler()
    Scroller.classList.add('moving')
    touchStartHorizontal = value
    touchStartTimestamp = fromNow()
  }

  function onTouchEnd(event, value) {
    event.stopPropagation()

    let toIndex
    let timeout = getTimeout(touchStartHorizontal, value)

    if (fromNow(touchStartTimestamp) < 300) {
      toIndex = getDirectIndex(value)
      timeout = 600
    }
    else {
      toIndex = getCloseIndex(value)
    }

    current = addMonth(current, toIndex)
    setHeader()

    // Header.style.background = Colors[Math.abs(current) % Colors.length]
    this.to(getValue(toIndex), timeout)


    clearMovingHandler = cancelTimeout.call(this, toIndex, timeout)

    return false
  }

  function cancelTimeout(index, timeout) {
    let handler = setTimeout(change.bind(this), timeout)

    function change() {
      handler = null
      if (!!index) {
        changeCurrentNumber(index)
        this.to(getValue(), 0)
        changeOtherNumber()
      }
      Scroller.classList.remove('moving')
    }

    return function() {
      clearTimeout(handler)

      if (handler) {
        this.to(getValue(index), 0)
        change.call(this)
      }
    }.bind(this)
  }

  function getTimeout(startValue, endValue, time = 600, base = DW) {
    let value = Math.abs(endValue - startValue)
    base *= .5

    if (value > base) {
      return time - time * (value - base) / base
    }
    else {
      return time * value / base
    }
  }

  function getValue(index = 0, base = DW) {
    return 0 - (index + 1) * base
  }

  function getDirectIndex(value, base = DW) {
    value = Math.abs(value) - base

    if (Math.abs(value) < 20) {
      return 0
    }

    return value > 0 ? 1 : -1
  }

  function getCloseIndex(value, base = DW) {
    value = Math.abs(value)

    if (value <= base * .6) {
      return -1
    }
    else if (value > base * .6 && value < base * 1.4) {
      return 0
    }
    else {
      return 1
    }
  }

  function fromNow(now) {
    let time = new Date().getTime()

    return now ? time - now : time
  }

})(jQuery, document, AlloyTouch, Transform);
