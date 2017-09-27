(function($$, AlloyTouch, Transform) {
  const Colors = ['rgb(255, 99, 132)', 'rgb(255, 159, 64)', '#fff077', 'rgb(75, 192, 192)', 'rgb(54, 162, 235)', 'rgb(153, 102, 255)', '#515465']
  const Wrapper = $$.getElementById('wrapper')
  const Scroller = $$.querySelector('.items')
  const Items = Scroller.querySelectorAll('.item')
  const DW = $$.body.scrollWidth

  let clearMovingHandler = null
  let touchStartTimestamp = 0
  let touchStartHorizontal = 0
  let current = 0

  Transform(Scroller, true)

  Items.forEach((el, index) => setNumber(el, index - 1))

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
      originHeight = parseInt(Wrapper.style.height, 10)
      if (isNaN(originHeight)) {
        originHeight = DW
      }
      event.stopPropagation()
      return false
    },
    touchMove: function(event, value) {
      let height = originHeight + value
      if (height > DW || height < .4 * DW) {
        return false
      }

      Wrapper.style.height = height + 'px'
      Wrapper.style.fontSize =  (128 * height / DW < 42) ? '42px' : (128 * height / DW + 'px')
      return false
    },
    touchEnd: function(event, value) {
      let height = originHeight + value

      if (height < .7 * DW) {
        Wrapper.style.height = .4 * DW + 'px'
        Wrapper.style.fontSize = '42px'
      }
      else {
        Wrapper.style.height = DW + 'px'
        Wrapper.style.fontSize = '128px'
      }


    }
  })

  function changeCurrentNumber(index) {
    current += index
    setNumber(Items[1], current)
  }

  function changeOtherNumber() {
    setNumber(Items[0], current - 1)
    setNumber(Items[2], current + 1)
  }

  function setNumber(el, number) {
    el.innerHTML = number
    el.style.background = Colors[Math.abs(number) % Colors.length]
  }

  function onTouchStart(event, value) {
    clearTimeout(clearMovingHandler)
    touchStartHorizontal = value
    touchStartTimestamp = fromNow()
  }

  function onTouchEnd(event, value) {
    let toIndex
    let time = getTime(touchStartHorizontal, value)

    if (fromNow(touchStartTimestamp) < 300) {
      toIndex = getDirectIndex(value)
      time = 600
    }
    else {
      toIndex = getCloseIndex(value)
    }

    this.to(getValue(toIndex), time)

    clearMovingHandler = setTimeout(() => {
      if (!!toIndex) {
        changeCurrentNumber(toIndex)
        this.to(getValue(), 0)
        changeOtherNumber()
      }

    }, time)

    return false
  }

  function getTime(startValue, endValue, time = 600, base = DW) {
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

})(document, AlloyTouch, Transform);
