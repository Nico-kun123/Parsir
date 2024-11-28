<script lang="ts" setup>
const props = defineProps({
  isAdmin: {
    type: Boolean,
    required: true,
    default: false
  }
})
</script>

<template>
  <div class="wrapper">
    <div class="instructions">
      <h3 class="instructions__title">Как пользоваться сервисом?</h3>

      <ol class="instructions__list">
        <li class="instructions__item">
          <p class="instructions__text">
            На главной странице выберите категорию товаров и нажмите "Собрать". Есть возможность
            собрать данные по всем категориям.
          </p>
        </li>

        <li class="instructions__item">
          <p class="instructions__text">
            В новом окне будет отображаться список товаров с графиками изменения стоимости.
          </p>
        </li>

        <li class="instructions__item">
          <p class="instructions__text">
            Если хотите экспортировать данные в файл, то Вам необходимо выбрать формат файла (CSV,
            XML или PDF) и нажать на кнопку "Экспорт".
          </p>
        </li>
      </ol>
    </div>

    <div v-if="props.isAdmin" class="instructions">
      <h3 class="instructions__title">Как администраторам пользоваться сервисом?</h3>
      <p class="instructions__description">
        У администраторов есть права доступа к страницам сервиса, с помощью которых можно
        редактировать информацию о пользователях.
      </p>

      <ol class="instructions__list">
        <li class="instructions__item">
          <p class="instructions__text">
            На странице "Пользователи" администратор может редактировать информацию о пользователях
            (добавлять и удалять пользователей, изменять их роли). Например, можно добавить в
            систему нового администратора.
          </p>
        </li>
      </ol>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.wrapper {
  margin-top: toRem(110);

  & .instructions {
    border-radius: toRem(12);
    display: flex;
    flex-direction: column;
    justify-content: center;
    margin: auto;
    padding-top: 0;

    width: fit-content;
    height: fit-content;
    max-width: toRem(600);

    color: map-get($map: $UI-color, $key: 'text-black');
    border: 1px solid map-get($map: $UI-color, $key: 'text-black');
    transition: $transition-easing-4 $transition-duration-normal;

    &:first-child {
      margin-top: toRem(30);
    }
    &:not(:first-child) {
      margin-top: toRem(20);
    }
    &__title {
      border-top-right-radius: toRem(12);
      border-top-left-radius: toRem(12);
      height: 100%;
      text-align: center;
      margin: 0;
      padding: 0;
      background-color: map-get($map: $UI-color, $key: 'bg-color-alt');
      color: map-get($map: $UI-color, $key: 'text-white');
    }

    &__description {
      padding-left: toRem(20);
      padding-top: toRem(10);
    }

    &__list {
      margin: 0;
    }

    &__item {
      padding: 0 toRem(10);

      &:first-of-type {
        padding-top: toRem(20);
      }
    }
  }
}
</style>
