import { defineStore } from 'pinia'
import axios from 'axios'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: localStorage.getItem('token') || ''
  }),
  actions: {
    /**
     * Функционал для авторизации пользователя.
     * Авторизует пользователя по электронной почте и хэшированному паролю.
     *
     * @param email Электронная почта пользователя.
     * @param password Пароль пользователя.
     * @returns Если пользователь авторизован, возвращает true. В противном случае false.
     */
    async login(email: string, password: string) {
      try {
        const { data } = await axios.post('http://localhost:3000/api/loginUser', {
          email,
          password
        })
        this.token = data.token
        localStorage.setItem('token', this.token)
        axios.defaults.headers.common['Authorization'] = `Bearer ${this.token}`

        // Получаем роль пользователя и сохраняем ее в localStorage
        const { data: userRole } = await axios.post('http://localhost:3000/api/get-user-role', {
          email
        })
        localStorage.setItem('userRole', userRole)

        return true
      } catch (error) {
        console.error('❌ Ошибка авторизации', error)
        return false
      }
    },

    /**
     * Функционал выхода из системы.
     * Удаляет токены из localstorage и удаляет заголовок Authorization из axios.
     */
    logout() {
      localStorage.clear()
      axios.defaults.headers.common['Authorization'] = undefined
      this.token = ''
    },

    /**
     * Проверяет, авторизован ли пользователь.
     *
     * Если пользователь не авторизован или срок действия токена истек, удаляет токен из хранилища и возвращает false.
     * Иначе возвращает true.
     *
     * @returns Если пользователь авторизован, возвращает true. В противном случае false.
     */
    checkAuth() {
      // Проверяем наличие токена
      if (!this.token) return false

      try {
        // Проверяем срок действия токена
        const payload = JSON.parse(atob(this.token.split('.')[1]))
        if (Date.now() > payload.exp * 1000) {
          // Срок действия токена истек
          this.logout()
          return false
        }
        return true
      } catch {
        this.logout()
        return false
      }
    }
  },
  getters: {
    /**
     * Проверяет, авторизован ли пользователь.
     *
     * @param state Состояние авторизации.
     * @returns Если пользователь авторизован, возвращает true. В противном случае false.
     */
    isAuthenticated: (state) => !!state.token
  }
})
