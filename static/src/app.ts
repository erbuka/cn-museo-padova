import './style.scss'
import 'swiper/css'

import Swiper from 'swiper'
import { Autoplay } from 'swiper/modules'



window.addEventListener('DOMContentLoaded', () => {
  const appContainer = document.querySelector('.cn-app-container') as HTMLElement
  const sliderContainer = document.querySelector('.cn-slider .swiper') as HTMLElement
  const bottomBar = document.querySelector('.cn-bottom-bar') as HTMLElement

  if (appContainer.dataset.reloadInterval) {
    const reloadInterval = parseInt(appContainer.dataset.reloadInterval)
    setInterval(() => {
      window.location.reload()
    }, reloadInterval * 1000)
  }

  const onSlideEntered = (slide: HTMLElement) => {
    slide.dataset.cnBottomTextVisible === 'true' ?
      bottomBar.classList.remove('cn-hidden') :
      bottomBar.classList.add('cn-hidden')

    slide.querySelectorAll<HTMLVideoElement>('video').forEach(el => el.play())
  }

  const onSlideExited = (slide: HTMLElement) => {
    slide.querySelectorAll<HTMLVideoElement>('video').forEach(el => {
      el.pause()
      el.currentTime = 0
    })
  }

  const swiper = new Swiper(sliderContainer, {
    modules: [Autoplay],
    autoplay: {
      disableOnInteraction: false,
      pauseOnMouseEnter: false,
    },
    loop: true,
    on: {
      afterInit(swiper) {
        onSlideEntered(swiper.slides[swiper.activeIndex] as HTMLElement)
      },
      slideChangeTransitionEnd(swiper) {
        onSlideExited(swiper.slides[swiper.previousIndex] as HTMLElement)
        onSlideEntered(swiper.slides[swiper.activeIndex] as HTMLElement)
      },
    }
  })


})