<script lang="ts">
import { onMounted, ref, computed } from 'vue'
import axios from 'axios'

// Импорт компонентов
import NavBar from '@/components/NavBar.vue'
import PaginationPageNext from '@/components/icons/PaginationPageNext.vue'
import PaginationPagePrevious from '@/components/icons/PaginationPagePrevious.vue'

// Импорт хранилищ
import { useUsersStore } from '@/stores/useUsersStore'

// Импорт плагинов
import makeMessageHead from '@/plugins/makeMessageHead.js'

export default {
  name: 'UsersView',
  components: { NavBar, PaginationPageNext, PaginationPagePrevious },
  setup() {
    interface User {
      id: number
      login: string
      email: string
      password: string
      isadmin: boolean
      regdate: string
      lastlogin: string
    }

    const usersStore = useUsersStore()

    const asc: Ref<boolean> = ref(true)
    const allUsers: Ref<User[]> = ref([])
    const currentPage: Ref<number> = ref(1)
    const filteredUsers: ComputedRef<User[]> = computed(() => {
      users.value.filter((user) =>
        Object.values(user).some((val) =>
          String(val).toLowerCase().includes(searchQuery.value.toLowerCase())
        )
      )
      const start = (currentPage.value - 1) * paginationPerPage.value
      const end = start + paginationPerPage.value
      return users.value.slice(start, end)
    })
    const paginationPerPage: Ref<number> = ref(6)
    const pages = computed(() => {
      const start = Math.max(1, currentPage.value - 2)
      const end = Math.min(totalPages.value, currentPage.value + 2)
      return Array.from({ length: end - start + 1 }, (_, i) => start + i)
    })
    const sortedColumn: Ref<keyof User> = ref('')
    const searchQuery: Ref<string> = ref('')
    const totalPages = computed(() => Math.ceil(allUsers.value.length / paginationPerPage.value))

    const users: Ref<User[]> = ref([])

    const getAllUsers = async (): Promise<void> => {
      try {
        await usersStore.fetchAllUsers()
        users.value = allUsers.value = usersStore.allUsers
        console.log(`${makeMessageHead('SUCCESS')}: Данные пользователей получены!`)
        sortUsers('email')
      } catch (error: any) {
        console.log(`${makeMessageHead('ERROR')}: ${error.response ? error.response.data : error}`)
      }
    }

    const sortUsers = (column: keyof User): void => {
      const multiplier = asc.value ? 1 : -1
      users.value.sort((a, b) => (a[column] < b[column] ? -1 : 1) * multiplier)
      sortedColumn.value = column
      asc.value = !asc.value
    }

    const filterBy = (data: 'admin' | 'user' | 'all'): void => {
      resetFilter()
      sortUsers('email')
      if (data !== 'all') {
        users.value = users.value.filter((user) =>
          data === 'admin' ? user.isadmin : !user.isadmin
        )
      }
    }

    const resetFilter = (): void => {
      users.value = allUsers.value
    }

    const prevPage = () => {
      if (currentPage.value > 1) {
        currentPage.value--
      }
    }

    const nextPage = () => {
      if (currentPage.value < totalPages.value) {
        currentPage.value++
      }
    }

    const changePage = (page: number) => {
      currentPage.value = page
    }

    onMounted(() => {
      getAllUsers()
      // sortUsers('isadmin')
    })

    return {
      users,
      sortUsers,
      searchQuery,
      filteredUsers,
      filterBy,
      prevPage,
      nextPage,
      currentPage,
      totalPages,
      pages,
      changePage
    }
  }
}

// TODO: На странице с таблицей пользователей можно добавить несколько функций, чтобы улучшить работу с таблицей:

/**
 *
 * Фильтрация: добавить поле для ввода текста, которое позволит пользователю фильтровать таблицу по имени, email или другим полям.
 *
 * Редактирование: добавить кнопку для редактирования записей в таблице.
 *
 * Удаление: добавить кнопку для удаления записей из таблицы.
 *
 * Экспорт: добавить кнопку для экспорта таблицы в формате CSV или Excel.
 *
 * Импорт: добавить кнопку для импорта таблицы из файла CSV или Excel.
 *
 */
</script>

<template>
  <NavBar />
  <div class="wrapper">
    <h1 class="title">Пользователи сайта</h1>
    <div class="search">
      <label for="search" class="search__label">Поиск:</label>
      <input
        type="text"
        id="search"
        name="search"
        v-model="searchQuery"
        placeholder="Поиск по полям..."
        class="search__input"
      />
    </div>

    <div class="filters">
      <div class="filters__block">
        <label for="filter" class="filters__block__label">Фильтр №1:</label>
        <select
          name="filter"
          id="filter"
          class="filters__block__select"
          @change="filterBy($event.target.value)"
        >
          <option value="all">Все пользователи</option>
          <option value="admin">Только администраторы</option>
          <option value="user">Только пользователи</option>
        </select>
      </div>
    </div>

    <div class="pagination">
      <!-- <button @click="prevPage" :disabled="currentPage === 1">Назад</button> -->
      <PaginationPagePrevious @click="prevPage" :disabled="currentPage === 1" />
      <span v-if="pages[0] > 1">...</span>
      <span
        v-for="page in pages"
        :key="page"
        @click="changePage(page)"
        :class="{ active: page === currentPage }"
        >{{ page }}</span
      >
      <span v-if="pages[pages.length - 1] < totalPages">...</span>
      <span>({{ currentPage }} / {{ totalPages }})</span>
      <!-- <button @click="nextPage" :disabled="currentPage === totalPages">Вперед</button> -->
      <PaginationPageNext @click="nextPage" :disabled="currentPage === totalPages" />
    </div>

    <table class="users">
      <thead>
        <tr class="users__header">
          <!-- <th class="users__header__name" @click="sortUsers('id')">ID</th> -->
          <th class="users__header__name" @click="sortUsers('email')">Email</th>
          <!-- <th class="users__header__name" @click="sortUsers('login')">Логин</th> -->
          <th class="users__header__name" @click="sortUsers('password')">Пароль</th>
          <th class="users__header__name" @click="sortUsers('isadmin')">Роль</th>
          <th class="users__header__name" @click="sortUsers('regdate')">Дата регистрации</th>
          <th class="users__header__name" @click="sortUsers('lastlogin')">Последний вход</th>
        </tr>
      </thead>

      <tbody>
        <tr v-for="user in filteredUsers" :key="user.id" class="users__row">
          <td class="users__row__name">{{ user.email }}</td>
          <!-- <td class="users__row__name">{{ user.login ? user.login : '—' }}</td> -->
          <td class="users__row__name">{{ user.password }}</td>
          <td class="users__row__name admin" v-if="user.isadmin">{{ 'Администратор' }}</td>
          <td class="users__row__name user" v-else>{{ 'Пользователь' }}</td>
          <td class="users__row__name">
            {{ user?.reg_date.split('T')[0] + ' ' + user?.reg_date.split('T')[1].split('.')[0] }}
          </td>
          <td class="users__row__name">
            {{
              user?.last_login
                ? user?.last_login.split('T')[0] +
                  ' ' +
                  user?.last_login.split('T')[1].split('.')[0]
                : '—'
            }}
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style lang="scss" scoped>
.wrapper {
  margin-top: toRem(110);
  display: flex;
  flex-direction: column;
  // justify-content: center;
  // align-items: center;
  width: 100%;
  padding: 0 toRem(20);

  & .title {
    text-align: center;
  }

  /* Поле поиска */
  & .search {
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    justify-items: left;
    margin: toRem(20) 0 0 0;
    width: toRem(400);

    &__label {
      font-size: $font-size-normal;
      font-weight: $font-weight-medium;
      margin: 0;
      margin-right: toRem(19);
      text-align: center;
    }
    &__input {
      border: none;
      // padding: 12px 14px;
      width: 100%;
      border: 1px solid map-get($map: $UI-color, $key: 'form-border');
    }
  }

  /* Поле с фильтрами */
  & .filters {
    &__title {
      // text-align: center;
    }

    &__block {
      display: flex;
      flex-direction: row;
      justify-content: left;
      align-items: center;
      justify-items: left;
      margin: toRem(20) 0 0 0;
      // width: toRem(400);

      &__label {
        font-size: $font-size-normal;
        font-weight: $font-weight-medium;
        margin: 0;
        margin-right: toRem(10);
        text-align: center;
      }

      &__select {
        // padding: 12px 14px;
      }
    }
  }

  & .pagination {
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    justify-items: left;
    margin: toRem(20) 0 0 0;
    width: 100%;

    & span {
      cursor: pointer;
      border-radius: toRem(5);
      border: 1px solid map-get($map: $UI-color, $key: 'bg-color');
      margin: 0 toRem(10);
      padding: toRem(5) toRem(10);
      transition: $transition-easing-4 $transition-duration-normal;
      text-align: center;

      &::selection {
        background-color: transparent;
      }

      &:hover:not(:last-of-type) {
        background-color: map-get($map: $UI-color, $key: 'pagination-bg-hover');
        color: white;
        border-radius: toRem(25);
      }

      &:last-of-type {
        // margin-right: 0;
        color: white;
        background-color: black;
      }
    }
  }

  /* Таблица */
  & .users {
    width: 100%;
    max-width: 100%;
    // margin: auto;
    // margin-left: auto;
    // margin-right: auto;

    &__header {
      & th {
        transition: $transition-easing-4 $transition-duration-normal;
        // background-color: map-get($map: $UI-color, $key: 'bg-color-alt');

        &:hover {
          // background-color: map-get($map: $UI-color, $key: 'bg-color');
        }
      }
      &__name {
        font-size: $font-size-normal;
        font-weight: $font-weight-bold;
        cursor: pointer;
        margin: 0;
        text-align: center;
      }
    }

    &__row {
      &__name {
        font-size: $font-size-normal;
        font-weight: $font-weight-medium;
        margin: 0;
        text-align: center;
        max-width: toRem(180);

        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;

        &:nth-child(3) {
          // max-width: toRem(180);
        }
      }
    }
  }
}

/* Стили для строки с админом */
.admin {
  color: map-get($map: $UI-color, $key: 'admin');
}
</style>
