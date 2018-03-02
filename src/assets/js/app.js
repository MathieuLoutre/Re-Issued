import $ from 'jquery'
import { TweenMax, TimelineMax } from 'gsap'
import { Howl } from 'howler'
import enableInlineVideo from 'iphone-inline-video'
require('babel-polyfill')

const mobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)

if (mobile) {
    // if mobile change CTA to hold
}

const $video = $('#intro-video')
const $progress = $('#progress')

const video = $video.get(0)
enableInlineVideo(video)

let loaded = false

const loadingTimeline = new TimelineMax()
loadingTimeline.to('.re', 0.5, { opacity: 1 })
loadingTimeline.to('.loading-bar .progress', 2, { width: '100%' })
loadingTimeline.to('.issued', 0.5, { opacity: 1, repeatDelay: 0.5 })

const showVideo = () => {
    if (!loaded) {
        loaded = true
        $video.fadeIn(250)
    }
}

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
        start: 0.05,
        end: 7.5
    },
    {
        name: 'backwards-speed',
        start: 7.55,
        end: 14.3,
        reverse: true
    },
    {
        name: 'speed',
        start: 7.55,
        end: 14.3
    },
    {
        name: 'sequence',
        start: 14.5,
        end: 53.5
    }
]

const baseSpeed = 0.5
const maxSpeed = 1.5
const speedInterval = maxSpeed - baseSpeed

const baseVolume = 0.25
const maxVolume = 1
const volumeInterval = maxVolume - baseVolume

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

const bgStart = new Howl({
    src: ['./assets/audio/bg-start.mp3'],
    loop: true,
    autoplay: true,
    volume: baseVolume,
    rate: baseSpeed
})

const bgEnd = new Howl({
    src: ['./assets/audio/bg-end.mp3'],
    loop: true,
    volume: 0
})

setInterval(function () {
    if (steps[step].pass && video.currentTime >= steps[step].end) {
        step++

        // if (steps[step].name === 'end-broadcast') {
        //     $('#start-again, #logo-wrapper').removeClass('hide')
        //     setTimeout(function () {
        //         $('#logo-wrapper').addClass('high')
        //         $('#ethos, #address').removeClass('hide')
        //     }, 600)
        // }
    }
    else {
        if (video.currentTime >= steps[step].end && !down && !steps[step].reverse) {
            video.currentTime = steps[step].start
        }
    }
}, 30)

const _update = function (progress) {
    $progress.css('width', `${progress}%`)

    bgStart.volume(baseVolume + (progress / 100) * volumeInterval)
    bgStart.rate(baseSpeed + (progress / 100) * speedInterval)
}

const startLoop = function () {
    if (down && !reached) {
        elapsed = Date.now() - startTime
        progress = (elapsed / maxTime) * 100

        _update(progress)

        if (progress >= 100) {
            reached = true
            step = 3

            video.currentTime = steps[step].start

            // $('#progress-bar, #logo-wrapper').addClass('hide')

            bgStart.fade(maxVolume, 0, 500)

            bgEnd.seek(0)
            bgEnd.play()
            bgEnd.fade(0, 1, 500)
        }
        else {
            requestAnimationFrame(startLoop)
        }
    }
    else if (!reached) {
        if (progress !== 0) {
            endElapsed = Date.now() - endTime
            endProgress = (1 - (endElapsed / decreaseTime)) * progress

            _update(endProgress)

            if (endProgress > 0) {
                requestAnimationFrame(startLoop)
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
            startLoop()
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

        video.currentTime = steps[step].end - (steps[step].end - steps[step].start) * progress / 100
    }
}

$('body').on('mousedown', startPress)
$('body').on('mouseup', endPress)

$('body').on('touchstart', startPress)
$('body').on('touchend', endPress)

$('body').on('keydown', startPress)
$('body').on('keyup', endPress)

// $('#start-again').on('click', function () {
//     step = 0

//     $('#logo-wrapper').removeClass('high')
//     $('#ethos, #start-again, #address').addClass('hide')
//     $('#progress-bar').removeClass('hide')

//     progress = 0
//     endProgress = 0
//     reached = false
//     video.currentTime = 0
//     video.play()

//     $progress.css('width', '0')

//     bgEnd.fade(1, 0, 500)
//     bgStart.seek(0)
//     bgStart.rate(baseSpeed)
//     bgStart.fade(0, baseVolume)
// })

// $(document).on({
//     'show': function () {
//         if (!reached) {
//             bgStart.play()
//         }
//         else {
//             bgEnd.play()
//         }
//     },
//     'hide': function () {
//         if (!reached) {
//             bgStart.pause()
//         }
//         else {
//             bgEnd.pause()
//         }
//     }
// })
