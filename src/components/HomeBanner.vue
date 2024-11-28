<script setup lang="ts"></script>

<template>
  <div class="banner">
    <div class="banner__text">
      <h1 class="banner__text__title"><mark>ParSir</mark> — сервис для парсинга данных.</h1>
      <p class="banner__text__description">
        Сервис собирает данные товаров с сайтов интернет-магазинов (категория "Электроника") и
        сохраняет динамику изменения цен товаров. Собранные данные можно экспортировать в форматах
        CSV, XML и PDF.
      </p>
      <p class="banner__text__description">
        Также сервис осуществлять прогнозирование цен товаров на несколько дней вперёд.
      </p>
    </div>

    <img
      class="banner__image"
      src="@/assets/img/UI/banner.png"
      alt="ParSir Logo"
      loading="lazy"
      draggable="false"
      width="20"
    />
  </div>
</template>

<style scoped lang="scss">
.banner {
  display: flex;
  flex-direction: column-reverse;
  justify-content: space-evenly;
  align-items: center;
  width: 100%;
  height: fit-content;

  margin-top: toRem(110);
  padding: 0 toRem(25);

  color: map-get($map: $UI-color, $key: 'text-black');
  font-size: $font-size-small;
  transition: $transition-easing-4 $transition-duration-normal;

  &__text {
    width: 100%;
    &__title {
      line-height: 1;
      text-align: center;
    }
    &__description {
      font-weight: $font-weight-normal;

      &:not(:last-of-type) {
        margin-bottom: toRem(10);
      }
    }
  }

  &__image {
    padding: 0;
    margin: 0;
    line-height: 0;
    // margin-top: toRem(30);
    // margin: toRem(30);
    width: toRem(150);

    border-radius: $border-radius-large;
    transition: $transition-easing-4 $transition-duration-normal;
  }
}
/* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */
/* ✨ RESPONSIVENESS ✨ */
/* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */
/* 600px */
@include responsiveness(tablet-portrait) {
  .banner {
    flex-direction: row;
    margin-top: toRem(95);

    padding: 0 toRem(50);

    &__text {
      &__title {
        text-align: left;
      }
    }

    &__image {
      // margin: 0;
      margin: toRem(15);
      width: toRem(150);
    }
  }
}

/* 900px */
@include responsiveness(tablet-landscape) {
  .banner {
    margin-top: toRem(100);
    height: fit-content;
    padding: 0 toRem(100);

    &__image {
      width: toRem(200);
      // margin: toRem(30) 0;
    }
  }
}

/* 1200px */
@include responsiveness(desktop) {
  .banner {
    margin-top: toRem(120);
    height: fit-content;

    padding: 0 toRem(120);

    &__image {
      width: toRem(300);
    }
  }
}
</style>
