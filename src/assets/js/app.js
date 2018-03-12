import $ from 'jquery'
import { TweenMax, TimelineMax, Linear } from 'gsap'
import { Howl, Howler } from 'howler'
import enableInlineVideo from 'iphone-inline-video'
import { Queue, Section } from './direct-manipulation'
import debounce from 'lodash/debounce'
import throttle from 'lodash/throttle'
require('babel-polyfill')

Howler.mobileAutoEnable = false

const $window = $(window)
let wHeight = $('#intro').height()
let muted = false

const toggleSound = () => {
    if (muted) {
        Howler.volume(1)
        soundAnimation.play()
        muted = false
        $('#sound-state').text('ON')
    }
    else {
        Howler.volume(0)
        muted = true
        soundAnimation.pause()
        TweenMax.to('#sound-icon .wrap div', 0.5, { height: '20%' })
        $('#sound-state').text('OFF')
    }
}

const resizeHandler = () => {
    wHeight = $('#intro').height()
    animationQueue.resetBounds(wHeight)

    if (wHeight > $window.width()) {
        $video.html('<source src="/assets/images/mobile.mp4">')
    }
    else {
        $video.html('<source src="/assets/images/desktop.mp4">')
    }
}

const showVideo = () => {
    if (!loaded) {
        loadingTimeline.repeat(0)
        loaded = true
    }
}

// eslint-disable-next-line no-unused-vars
const animationQueue = new Queue([
    new Section({
        tween: TweenMax.from('#no-caps .strike', 1, { width: '0%' }),
        trigger: 1.8,
        length: 0.6
    }),
    new Section({
        tween: TweenMax.set('#no-caps', { position: 'fixed' }),
        trigger: 2
    }),
    new Section({
        tween: new TimelineMax({ paused: true, ease: Linear.easeNone })
            .to('#no-caps-wrap .image-stack.one', 1, { y: '0%' })
            .to('#no-caps-wrap .image-stack.two', 1, { y: '0%' })
            .to('#no-caps-wrap .image-stack.three', 1, { y: '0%' })
            .to('#no-caps-wrap .image-stack.four', 1, { y: '0%' })
            .to('#no-caps-wrap .image-stack.five', 1, { y: '0%' })
            .to('#no-caps-wrap .image-stack.six', 1, { y: '0%' })
            .to('#no-caps-wrap .image-stack.seven', 1, { y: '0%' })
            .to('#no-caps-wrap .image-stack.eight', 1, { y: '0%' })
            .to('#no-caps, #no-caps-wrap .image-stack', 1, { y: '-100%' }),
        trigger: 2,
        length: 9
    }),
    new Section({
        tween: TweenMax.from('#no-trainers .strike', 1, { width: '0%' }),
        trigger: 10.8,
        length: 0.6
    }),
    new Section({
        tween: TweenMax.set('#no-trainers', { position: 'fixed' }),
        trigger: 11
    }),
    new Section({
        tween: new TimelineMax({ paused: true, ease: Linear.easeNone })
            .to('#no-trainers-wrap .image-stack.one', 1, { y: '0%' })
            .to('#no-trainers-wrap .image-stack.two', 1, { y: '0%' })
            .to('#no-trainers-wrap .image-stack.three', 1, { y: '0%' })
            .to('#no-trainers-wrap .image-stack.four', 1, { y: '0%' })
            .to('#no-trainers-wrap .image-stack.five', 1, { y: '0%' })
            .to('#no-trainers-wrap .image-stack.six', 1, { y: '0%' })
            .to('#no-trainers-wrap .image-stack.seven', 1, { y: '0%' })
            .to('#no-trainers-wrap .image-stack.eight', 1, { y: '0%' })
            .to('#no-trainers-wrap .image-stack.nine', 1, { y: '0%' })
            .to('#no-trainers, #no-trainers-wrap .image-stack', 1, { y: '-100%', ease: Linear.easeNone }),
        trigger: 11,
        length: 10
    })
], wHeight)

const loadingTimeline = new TimelineMax({ onComplete: () => {
    loadedTimeline.play()
} }).repeat(-1)
loadingTimeline.staggerTo('#mark path', 0.4, { fillOpacity: 1 }, 0.25)

const loadedTimeline = new TimelineMax({ paused: true })
loadedTimeline.add(() => $('body').removeClass('no-scroll'))
loadedTimeline.to('#smoke-screen', 0.5, { opacity: 0, display: 'none' }, 'reduce')
loadedTimeline.to('#mark', 0.5, { width: '30%' }, 'reduce')
loadedTimeline.to('.logo-wrapper', 0.5, { top: '7%' }, 'reduce')
loadedTimeline.to('.menu-top', 2, { opacity: 1 }, 'reveal')
loadedTimeline.to('.menu-bottom', 2, { opacity: 1 }, 'reveal')

const soundAnimation = new TimelineMax({ repeat: -1, yoyo: true }).timeScale(1.5)
soundAnimation.to('#bar-1', 0.4, { height: '100%' })
soundAnimation.to('#bar-2', 0.5, { height: '100%' }, 'rise')
soundAnimation.to('#bar-1', 0.5, { height: '60%' }, 'rise')
soundAnimation.to('#bar-3', 0.3, { height: '100%' }, 'up')
soundAnimation.to('#bar-1', 0.4, { height: '20%' })
soundAnimation.to('#bar-2', 0.5, { height: '20%' }, '=+0.1')
soundAnimation.to('#bar-3', 0.3, { height: '20%' }, '=-0.2')

const touch = 'ontouchstart' in window

const $video = $('#intro-video')
const $progress = $('#progress')

resizeHandler()

const video = $video.get(0)
enableInlineVideo(video)

let loaded = false

if (video.readyState >= 2) {
    showVideo()
}
else {
    $video.on('canplaythrough', showVideo)
}

let step = 0
const steps = [
    {
        name: 'intro',
        start: 0.01,
        end: 4.0
    },
    {
        name: 'backwards-speed',
        start: 4.01,
        end: 5.0,
        reverse: true
    },
    {
        name: 'speed',
        start: 5.01,
        end: 9.21
    },
    {
        name: 'sequence',
        start: 9.22,
        end: 90
    }
]

let progress = 0
let elapsed = 0
let endElapsed = 0
let endProgress = 0

const maxTime = 5000
const decreaseTime = 550
let startTime = 0
let endTime = 0
let down = false
let reached = false

const introSound = new Howl({
    src: ['./assets/images/loop.mp3'],
    loop: true,
    autoplay: !touch
})

const loadingSound = new Howl({
    src: ['./assets/images/load.mp3'],
    loop: true
})

const reverseSound = new Howl({
    src: ['./assets/images/reverse.mp3']
})

const mainSound = new Howl({
    src: ['./assets/images/main.mp3'],
    loop: true
})

$video.on('ended', () => {
    step = 0

    TweenMax.to('#progress-wrapper', 0.5, { opacity: 1 })

    progress = 0
    endProgress = 0
    reached = false
    video.currentTime = 0
    video.play()

    $progress.css('width', '0')

    mainSound.pause()
    introSound.play()
})

setInterval(function () {
    if (steps[step].pass && video.currentTime >= steps[step].end) {
        step++
    }
    else {
        if (video.currentTime >= steps[step].end && !down && !steps[step].reverse) {
            video.currentTime = steps[step].start
        }
    }
}, 30)

const _update = function (progress) {
    $progress.css('width', `${progress}%`)
}

const videoStateManager = function () {
    if (down && !reached) {
        elapsed = Date.now() - startTime
        progress = (elapsed / maxTime) * 100

        _update(progress)

        if (elapsed > 500 && !loadingSound.playing()) {
            introSound.pause()
            loadingSound.seek(0)
            loadingSound.play()
        }

        if (progress >= 100) {
            reached = true
            step = 3

            video.currentTime = steps[step].start

            TweenMax.to('#progress-wrapper', 0.5, { opacity: 0 })

            loadingSound.pause()
            loadingSound.seek(0)
            mainSound.seek(0)
            mainSound.play()
        }
        else {
            requestAnimationFrame(videoStateManager)
        }
    }
    else if (!reached) {
        if (progress !== 0) {
            endElapsed = Date.now() - endTime
            endProgress = (1 - (endElapsed / decreaseTime)) * progress

            _update(endProgress)

            if (endProgress > 0) {
                requestAnimationFrame(videoStateManager)
            }
            else {
                progress = 0
                step = 0

                _update(0)

                video.currentTime = steps[step].start
            }
        }
    }
}

const startPress = function (ev) {
    if (ev.type === 'keydown' && (ev.which || ev.keyCode) !== 32) {
        return
    }
    else if (ev.type === 'keydown') {
        ev.preventDefault()
    }

    if (!reached && !down && loaded) {
        down = true
        step = 2

        if (progress <= 0) {
            video.currentTime = steps[step].start

            startTime = Date.now()
            videoStateManager()
        }
        else {
            startTime = Date.now() - ((endProgress / 100) * maxTime)

            video.currentTime = steps[step].start + (steps[step].end - steps[step].start) * endProgress / 100
        }
    }
}

const endPress = function (ev) {
    if (ev.type === 'keyup' && (ev.which || ev.keyCode) !== 32) {
        return
    }

    endTime = Date.now()
    down = false

    if (!reached) {
        step = 1

        loadingSound.pause()

        if (endTime - startTime > 500) {
            reverseSound.seek(0)
            reverseSound.play()
        }

        introSound.pause()
        introSound.seek(0)
        introSound.play()

        video.currentTime = steps[step].end - (steps[step].end - steps[step].start) * progress / 100
    }
}

$('#toggle-sound').on('click', toggleSound)

if (!touch) {
    $('#intro').on('mousedown', startPress)
    $('#intro').on('mouseup', endPress)

    $('body').on('keydown', startPress)
    $('body').on('keyup', endPress)
}
else {
    $('#intro').on('touchstart', startPress)
    $('#intro').on('touchend', endPress)

    $('#cta').html('<span>Tap and Hold</span>')
}

$window.on('resize', debounce(resizeHandler, 100))

const enterTheArchives = $('#enter-the-archives .bg-type')
const shopNow = $('#shop-now .bg-type')
const ticker = $('#shop-now .ticker')

$window.on('scroll', throttle((ev) => {
    const scroll = $window.scrollTop()

    if (scroll > wHeight) {
        video.pause()
    }
    else {
        if (video.paused) {
            video.play()
        }
    }

    if (scroll > 0 && scroll < wHeight * 2) {
        enterTheArchives.addClass('animated')
    }
    else {
        enterTheArchives.removeClass('animated')
    }

    if (scroll > wHeight * 20) {
        shopNow.addClass('animated')
        ticker.addClass('animated')
    }
    else {
        shopNow.removeClass('animated')
        ticker.removeClass('animated')
    }
}, 50))
