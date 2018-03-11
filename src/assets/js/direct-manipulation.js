import $ from 'jquery'
import debounce from 'lodash/debounce'

const clamp = (val, min, max) => Math.min(Math.max(val, min), max)
const lerp = (val, start, end) => start + (end - start) * val
const norm = (val, min, max) => (val - min) / (max - min)
const map = (val, min, max, start, end) => lerp(norm(val, min, max), start, end)

const $window = $(window)

export class Smoother {
    constructor (size) {
        this.size = size || 3
        this.samples = []
    }

    smooth (val) {
        let smoothVal = val

        if (this.samples.length < this.size) {
            this.samples.push(smoothVal)
        }
        else {
            for (let i = 0; i < this.size; i++) {
                smoothVal += this.samples[i]
            }

            smoothVal = smoothVal / (this.size + 1)

            this.samples.push(smoothVal)
            this.samples.shift()
        }

        return smoothVal
    }

    reset () {
        this.samples = []
    }
}

export class Section {
    constructor ({ tween, trigger, length }) {
        this.tween = tween.pause()
        this.smoother = new Smoother()
        this.progress = 0
        this.trigger = trigger
        this.length = length || 0
    }

    setBounds (wHeight) {
        this.start = this.trigger * wHeight
        this.end = this.start + this.length * wHeight

        this.smoother.reset()
    }

    update (currentScroll) {
        if (this.length) {
            const scroll = this.smoother.smooth(clamp(currentScroll, this.start, this.end))
            const progress = map(scroll, this.start, this.end, 0, 1)

            if (progress !== this.progress) {
                this.progress = progress
                this.tween.progress(this.progress)
            }
        }
        else {
            if (currentScroll >= this.start) {
                this.tween.play()
            }
            else if (!this.tween._reversed) {
                this.tween.reverse()
            }
        }
    }
}

export class Queue {
    constructor (sections, wHeight) {
        this.sections = sections || []
        this.currentScroll = $window.scrollTop()
        this.resetBounds(wHeight)

        this.loop()

        $window.on('scroll', () => {
            this.currentScroll = $window.scrollTop()
        })
    }

    resetBounds (wHeight) {
        this.sections.forEach((section) => section.setBounds(wHeight))
    }

    loop () {
        requestAnimationFrame(this.loop.bind(this))
        this.sections.forEach((section) => section.update(this.currentScroll))
    }
}
