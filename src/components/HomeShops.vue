<script setup lang="ts">
import { ref } from 'vue'

// Логотипы магазинов
import OzonLogo from '@/assets/img/Logo/Ozon Logo.svg'
import EldoradoLogo from '@/assets/img/Logo/Eldorado Logo.svg'

const shops = [EldoradoLogo, OzonLogo]
</script>

<template>
  <div class="wrapper">
    <h2 class="slideshow__title">Сервис собирает данные с сайтов интернет-магазинов</h2>
    <div class="slideshow">
      <div class="slideshow__item" v-for="(shop, index) in shops" :key="index">
        <img
          v-if="shop == EldoradoLogo"
          :src="shop"
          alt="shop logo"
          loading="lazy"
          draggable="false"
          width="200"
          height="100"
        />
        <img
          v-else
          :src="shop"
          alt="shop logo"
          loading="lazy"
          draggable="false"
          width="100"
          height="100"
        />
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
@keyframes slideshow {
  0% {
    transform: translateX(0);
  }
  100% {
    transform: translateX(-100%);
  }
}

.wrapper {
  display: flex;
  flex-direction: column;
  margin: toRem(20) auto;

  .slideshow {
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: row;
    // flex-wrap: wrap;

    padding: 0 toRem(30);
    min-height: toRem(100);
    overflow-x: visible;
    box-shadow: 0px 0px 8px 4px rgba(34, 60, 80, 0.2);

    &__title {
      text-align: center;
    }

    &__item {
      display: flex;
      justify-content: center;
      align-items: center;

      margin: toRem(10);

      & img {
      }
    }
  }
}

/* 320px */
@include responsiveness(phone-portrait) {
  .wrapper {
    margin: toRem(10) auto;

    .slideshow {
      &__title {
        font-size: $font-size-normal * 1.2;
        text-wrap: balance;
      }
      &__item {
        & img {
          transition: $transition-easing-4 $transition-duration-normal;
          width: calc(100% * 0.7);
        }
      }
    }
  }
}

/* 900px */
@include responsiveness(tablet-landscape) {
  .wrapper {
    margin: toRem(10) auto;

    .slideshow {
      &__title {
        font-size: $font-size-normal * 1.2;
        text-wrap: balance;
      }
      &__item {
        & img {
          width: calc(100% * 1);
        }
      }
    }
  }
}

/* 1200px */
@include responsiveness(desktop) {
  .wrapper {
    margin: toRem(10) auto;

    .slideshow {
      &__title {
        font-size: $font-size-normal * 1.2;
        text-wrap: balance;
      }
      &__item {
        & img {
          width: calc(100% * 1);
        }
      }
    }
  }
}
</style>
