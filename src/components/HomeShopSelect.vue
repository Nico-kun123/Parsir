<script lang="ts">
import { ref } from 'vue'

export default {
  name: 'HomeShopSelect',
  components: {},

  setup() {
    const selectedShop = ref('')
    const selectedCategory = ref('')

    const handleSelection = () => {
      //   if (selectedShop.value == 'eldorado') {
      //     if (selectedCategory.value == 'All') {
      //       window.location.href = '/shop/eldorado'
      //     } else {
      //       window.location.href = `/shop/eldorado/${selectedCategory.value}`
      //     }
      //   } else if (selectedShop.value == 'ozon') {
      //     if (selectedCategory.value == 'All') {
      //       window.location.href = '/shop/ozon'
      //     } else {
      //       window.location.href = `/shop/ozon/${selectedCategory.value}`
      //     }
      //   }

      console.log(selectedShop.value, selectedCategory.value)
    }

    return { selectedShop, selectedCategory, handleSelection }
  }
}
</script>

<template>
  <div class="wrapper">
    <h3 class="title">Выберите интернет-магазин:</h3>
    <select name="shop" id="shop" v-model="selectedShop">
      <option value="Эльдорадо">Эльдорадо</option>
      <option value="Ozon">Ozon</option>
    </select>
    <div v-if="selectedShop">
      <h3 class="title">Выберите категорию товаров:</h3>
      <select name="category" id="category" v-model="selectedCategory">
        <option value="All">(ВСЕ КАТЕГОРИИ)</option>
        <option value="Блендеры">Блендеры</option>
        <option value="Блоки питания">Блоки питания</option>
        <option value="Бритье и стрижка">Бритье и стрижка</option>
        <option value="Веб-камеры">Веб-камеры</option>
        <option value="Видеокамеры">Видеокамеры</option>
        <option value="Видеокарты">Видеокарты</option>
        <option value="Видеорегистраторы">Видеорегистраторы</option>
        <option value="Выпрямители для волос">Выпрямители для волос</option>
        <option value="Геймпады">Геймпады</option>
        <option value="Графические планшеты">Графические планшеты</option>
        <option value="Диктофоны">Диктофоны</option>
        <option value="Жесткие диски">Жесткие диски</option>
        <option value="Игровые приставки">Игровые приставки</option>
        <option value="Клавиатуры для компьютера">Клавиатуры для компьютера</option>
        <option value="Компьютерная акустика">Компьютерная акустика</option>
        <option value="Компьютерные мыши">Компьютерные мыши</option>
        <option value="Компьютеры">Компьютеры</option>
        <option value="Кофеварки">Кофеварки</option>
        <option value="Материнские платы">Материнские платы</option>
        <option value="Машинки для стрижки волос">Машинки для стрижки волос</option>
        <option value="Микроволновые печи">Микроволновые печи</option>
        <option value="Микрофоны">Микрофоны</option>
        <option value="Миксеры">Миксеры</option>
        <option value="Мониторы">Мониторы</option>
        <option value="Мультиварки">Мультиварки</option>
        <option value="Наушники">Наушники</option>
        <option value="Ноутбуки">Ноутбуки</option>
        <option value="Оперативная память">Оперативная память</option>
        <option value="Планшеты">Планшеты</option>
        <option value="Посудомоечные машины">Посудомоечные машины</option>
        <option value="Процессоры">Процессоры</option>
        <option value="Пылесосы">Пылесосы</option>
        <option value="Смарт-часы">Смарт-часы</option>
        <option value="Смартфоны">Смартфоны</option>
        <option value="Стиральные машины">Стиральные машины</option>
        <option value="Твердотельные накопители SSD">Твердотельные накопители SSD</option>
        <option value="Телевизоры">Телевизоры</option>
        <option value="Тостеры">Тостеры</option>
        <option value="Триммеры">Триммеры</option>
        <option value="Укладка волос">Укладка волос</option>
        <option value="Утюги">Утюги</option>
        <option value="Фены">Фены</option>
        <option value="Фитнес-браслеты">Фитнес-браслеты</option>
        <option value="Холодильники">Холодильники</option>
        <option value="Чайники электрические">Чайники электрические</option>
        <option value="Щипцы для завивки волос">Щипцы для завивки волос</option>
        <option value="Электробритвы мужские">Электробритвы мужские</option>
        <option value="Электронные книги">Электронные книги</option>
        <option value="Электронные кухонные весы">Электронные кухонные весы</option>
        <option value="Эпиляторы">Эпиляторы</option>
        <option value="GPS-навигаторы">GPS-навигаторы</option>
        <option value="MP3-плееры">MP3-плееры</option>
        <option value="USB-флешки">USB-флешки</option>
      </select>
    </div>
    <div v-if="selectedCategory">
      <button @click="handleSelection">Показать товары</button>
    </div>
  </div>
</template>

<style scoped lang="scss">
.wrapper {
  //   display: flex;
  //   justify-content: center;
  //   align-items: center;
  //   flex-direction: column;

  padding: 0 toRem(30);
}
</style>
