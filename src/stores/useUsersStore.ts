import { defineStore } from 'pinia'
import axios from 'axios'

export const useUsersStore = defineStore('allUsers', {
  state: () => ({
    users: []
  }),
  actions: {
    /**
     * Получает всех пользователей с сервера и сохраняет их в состояние.
     *
     * @async
     * @returns {Promise<void>} Промис, который разрешается, когда пользователи успешно получены.
     */
    async fetchAllUsers() {
      try {
        const serverPort = import.meta.env?.SERVER_PORT || 5500
        const response = await axios.get(`http://localhost:${serverPort}/api/get-all-users`)
        this.users = response.data
      } catch (error) {
        console.error(error)
      }
    }
  },
  getters: {
    /**
     * Функция-геттер для получения текущего состояния хранилища (список всех пользователей).
     *
     * @param state состояние внутри хранилища
     * @returns
     */
    allUsers: (state) => state.users
  }
})
