<script lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'

import process from 'process'

// Хранилище
import { useAuthStore } from '@/stores/authTokens'

export default {
  name: 'AuthRegisterView',

  setup() {
    const authStore = useAuthStore()

    const authEmail = ref('')
    const authPassword = ref('')
    const authErrors = ref('')

    const regEmail = ref('')
    const regPassword = ref('')
    const regErrors = ref('')

    const router = useRouter()

    const serverPort = process.env.SERVER_PORT || 5500

    /**
     * Проверка устройства пользователя.
     *
     * @returns true, если пользователь использует мобильное устройство
     */
    const isMobile = (): boolean =>
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile/i.test(navigator.userAgent)

    /**
     * Переключение формы между авторизацией и регистрацией.
     *
     * @param name - название формы (авторизация - 'auth', регистрация - 'reg')
     * @returns void
     */
    const switchToForm = (name: 'auth' | 'reg'): void => {
      const container = document.getElementById('container') as HTMLElement | null
      if (container) {
        container.classList.toggle('panel-active', name !== 'auth')
      }
    }

    /**
     * Валидация данных формы. Возвращает true, если данные валидны.
     *
     * Критерии валидации:
     * - Поля не могут быть пустыми!
     * - Email должен быть валидным и содержать от 5 до 50 символов!
     * - Пароль должен быть валидным и содержать от 5 до 30 символов!
     *
     * @param {string} email Введенный email.
     * @param {string} password Введенный пароль
     * @returns {[boolean, string]} Массив, где
     *   - первый элемент - true, если данные валидны, false - иначе;
     *   - второй элемент - текст ошибки, если данные не валидны, пустая строка - иначе.
     */
    const validateForm = (email: string, password: string): [boolean, string] => {
      if (!email || !password) {
        return [false, 'Поля не могут быть пустыми!']
      }

      // TODO: Раскомментировать

      // if (email.length < 5 || email.length > 50) {
      //   return [false, 'Email должен содержать от 5 до 50 символов!']
      // }

      // const emailRegex =
      //   /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/

      // if (!emailRegex.test(email)) {
      //   return [false, 'Email должен быть валидным!']
      // }

      // if (password.length < 5 || password.length > 30) {
      //   return [false, 'Пароль должен содержать от 5 до 30 символов!']
      // }

      // const passwordRegex =
      //   /^(?=.*[a-zA-Zа-яА-Я])(?=.*\d)(?=.*[@$!%*?&])[a-zA-Zа-яА-Я\d@$!%*?&]{5,30}$/

      // if (!passwordRegex.test(password)) {
      //   return [
      //     false,
      //     'Пароль должен включать как минимум 1 заглавную букву, 1 цифру и 1 особый символ, а также поддерживать английский и русский языки!'
      //   ]
      // }

      return [true, '']
    }

    /**
     * Осуществляет регистрацию нового пользователя в системе.
     *
     * Если данные валидны, то происходит регистрация, иначе выводится соответствующее сообщение.
     *
     * @param email Электронная почта регистрируемого пользователя.
     * @param password Пароль регистрируемого пользователя.
     */
    const registerUser = async (email: string, password: string) => {
      event?.preventDefault()

      // const validationResults: [boolean, string] = validateForm(email, password)
      // if (validationResults[0]) {
      //   try {
      //     await axios
      //       .post(`http://localhost:${serverPort}/api/registerUser`, {
      //         email: email,
      //         password: password
      //       })
      //       .then((response) => {
      //         if (response.status == 200) {
      //           regErrors.value = ''
      //           alert('✅ Аккаунт был успешно создан! Теперь Вы можете авторизоваться в системе!')
      //         }
      //         location.reload()
      //       })
      //       .catch((error) => {
      //         console.log(error.response.data)
      //         throw new Error(error.response.data)
      //       })
      //   } catch (error: any) {
      //     // Ошибки с сервера
      //     alert(`❌ Произошла ошибка при создании аккаунта!\n${error}`)
      //   }
      // } else {
      //   // Ошибки от клиента (валидация)
      //   regErrors.value = validationResults[1]
      //   alert('❌ ' + validationResults[1])
      // }

      const [isValid, errorMsg] = validateForm(regEmail.value, regPassword.value)
      if (isValid) {
        try {
          await axios.post(`http://localhost:${serverPort}/api/registerUser`, {
            email: regEmail.value,
            password: regPassword.value
          })
          alert('✅ Аккаунт успешно создан!')
          clearForm('reg')
          switchToForm('auth')
        } catch (error) {
          regErrors.value = 'Пользователь с таким email уже существует!'
        }
      } else {
        regErrors.value = errorMsg
      }
    }

    /**
     * Осуществляет авторизацию пользователя в системе.
     *
     * Если данные валидны, то происходит авторизация, иначе выводится соответствующее сообщение.
     *
     * @param email Электронная почта авторизовавшегося пользователя.
     * @param password Пароль авторизовавшегося пользователя.
     */
    const loginUser = async (email: string, password: string) => {
      event?.preventDefault()

      // if (email && password) {
      //   try {
      //     const response = await authStore.login(email, password)
      //     if (response) {
      //       router.push({ name: 'home' })
      //     } else {
      //       alert('❌ Произошла ошибка при авторизации!')
      //       console.log('Ошибка авторизации:', response)
      //     }
      //   } catch (error) {
      //     console.log('Ошибка авторизации:', error)
      //     alert('❌ Произошла ошибка при авторизации!')
      //   }
      // } else {
      //   alert('❌ Все поля должны быть заполнены!')
      // }

      const [isValid, errorMsg] = validateForm(authEmail.value, authPassword.value)
      if (isValid) {
        try {
          const success = await authStore.login(authEmail.value, authPassword.value)
          if (success) {
            router.push({ name: 'home' })
          } else {
            authErrors.value = 'Неверный email или пароль!'
          }
        } catch (error) {
          authErrors.value = 'При авторизации произошла ошибка!'
        }
      } else {
        authErrors.value = errorMsg
      }
    }

    /**
     * Очищает поля формы авторизации или регистрации.
     * @param {string} formName - имя формы, которую нужно очистить ('auth' или 'reg')
     * @returns {void}
     */
    const clearForm = (formName: 'auth' | 'reg'): void => {
      if (formName === 'auth') {
        authEmail.value = ''
        authPassword.value = ''
        authErrors.value = ''
      } else if (formName === 'reg') {
        regEmail.value = ''
        regPassword.value = ''
        regErrors.value = ''
      }
    }

    return {
      authEmail,
      authErrors,
      authPassword,
      clearForm,
      isMobile,
      loginUser,
      regEmail,
      regErrors,
      regPassword,
      registerUser,
      router,
      switchToForm,
      validateForm
    }
  }
}
</script>

<template>
  <div class="warning" v-if="isMobile()">
    <h1 class="warning__title">
      Сайт не доступен для просмотра так как ширина экрана слишком мала!
    </h1>
    <h3 class="warning__description">Пожалуйста, используйте компьютер</h3>
  </div>
  <div class="forms-wrapper" v-else>
    <div class="forms" id="container">
      <div class="forms__sign-up">
        <form>
          <h1>Регистрация</h1>
          <span class="forms__error">{{ regErrors }}</span>
          <input type="email" placeholder="Ваш Email" v-model="regEmail" />
          <input type="password" placeholder="Придумайте пароль" v-model="regPassword" />
          <br />
          <button type="submit" @click="registerUser(regEmail, regPassword)">
            Создать аккаунт
          </button>
        </form>
      </div>
      <div class="forms__sign-in">
        <form>
          <h1>Войдите в систему</h1>
          <span class="forms__error">{{ authErrors }}</span>
          <input type="email" placeholder="Ваш Email" v-model="authEmail" autofocus />
          <input type="password" placeholder="Введите ваш пароль" v-model="authPassword" />
          <br />
          <button type="submit" @click="loginUser(authEmail, authPassword)">Войти</button>
        </form>
      </div>

      <div class="overlay-container">
        <div class="overlay">
          <div class="overlay__panel left">
            <h1>Добро пожаловать!</h1>
            <p>Уже зарегистрированы? Войдите в систему, указав свои электронную почту пароль.</p>
            <button class="ghost" @click="switchToForm('auth')">У меня уже есть аккаунт</button>
          </div>
          <div class="overlay__panel right">
            <h1>С возвращением!</h1>
            <p>Для создания нового аккаунта нажмите на кнопку ниже.</p>
            <button class="ghost" @click="switchToForm('reg')">Создать аккаунт</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@keyframes fadein {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.warning {
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;

  background-color: black;
  animation: fadein 1.5s;
  padding: 0 toRem(20);

  &__title {
    font-size: 2rem;
    font-weight: $font-weight-bold;
    color: map-get($map: $UI-color, $key: 'text-404');
    margin: 0;
    text-align: center;
  }

  &__description {
    font-size: $font-size-large;
    color: map-get($map: $UI-color, $key: 'text-white');
    // margin: 0;
    text-align: center;
  }
}

.forms-wrapper {
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
}
.forms {
  background: #fff;
  border-radius: 10px;
  -webkit-box-shadow: $box-shadow-dark;
  box-shadow: $box-shadow-dark;
  // position: fixed;
  overflow: hidden;
  width: 900px;
  max-width: 100%;
  // height: 200px;
  min-height: 480px;
  // height: 100%;

  margin: auto;
  position: relative;

  animation: fadein 1.5s;

  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;

  &__error {
    color: map-get($map: $UI-color, $key: 'form-error');
  }

  /* Sign in and Sign up */
  &__sign-in {
    left: 0;
  }
  &__sign-up {
    right: 0;
  }
  &__sign-up,
  &__sign-in {
    z-index: 1;
    position: absolute;
    top: 0;
    height: 100%;
    width: 50%;
    -webkit-transition: $transition-duration-slow $transition-easing-4;
    -o-transition: $transition-duration-slow $transition-easing-4;
    transition: $transition-duration-slow $transition-easing-4;
  }

  /* Forms */
  & form {
    background: map-get($map: $UI-color, $key: 'white');
    display: -webkit-box;
    display: -ms-flexbox;
    display: flex;
    -webkit-box-orient: vertical;
    -webkit-box-direction: normal;
    -ms-flex-direction: column;
    flex-direction: column;
    padding: 0 50px;
    height: 100%;
    -webkit-box-pack: center;
    -ms-flex-pack: center;
    justify-content: center;
    -webkit-box-align: center;
    -ms-flex-align: center;
    align-items: center;
    text-align: center;

    & h1 {
      font-size: $font-size-large * 1.5;
    }

    & input {
      background: map-get($map: $UI-color, $key: 'bg-color');
      border: none;
      padding: 12px 14px;
      margin: 8px 0 0 0;
      width: 100%;
      border: 1px solid map-get($map: $UI-color, $key: 'form-border');
    }

    & button {
      border-radius: $border-radius-large;
      // border: 1px solid #2bdcff;
      // background: #2b83ff;
      // color: #fff;
      // font-size: 12px;
      // font-weight: bold;
      padding: 12px 36px;
      letter-spacing: 1px;
      text-transform: uppercase;

      &:active {
        -webkit-transform: scale(0.95);
        -ms-transform: scale(0.95);
        transform: scale(0.95);
      }
      &:focus {
        outline: none;
      }

      &:hover {
        background: map-get($map: $UI-color, $key: 'btn-bg-hover');
        color: map-get($map: $UI-color, $key: 'btn-text-hover');
      }
    }
  }

  & .ghost {
    background: transparent;
    font-size: $font-size-normal;
    // border-color: #fff;
  }

  /* Поле, которое двигается по горизонтали */
  .overlay-container {
    position: absolute;
    top: 0;
    left: 50%;
    width: 50%;
    height: 100%;
    overflow: hidden;
    -webkit-transition: -webkit-transform 0.6s ease-in-out;
    transition: -webkit-transform 0.6s ease-in-out;
    -o-transition: transform 0.6s ease-in-out;
    transition: transform 0.6s ease-in-out;
    transition:
      transform 0.6s ease-in-out,
      -webkit-transform 0.6s ease-in-out;
    z-index: 100;

    .overlay {
      $bg-color-1: map-get(
        $map: $UI-color,
        $key: 'auth-bg-1'
      );
      $bg-color-2: map-get(
        $map: $UI-color,
        $key: 'auth-bg-2'
      );
      background: $bg-color-2;
      background: -webkit-gradient(linear, left top, right top, from($bg-color-1), to($bg-color-2))
        no-repeat 0 0 / cover;
      background: -o-linear-gradient(left, $bg-color-1, $bg-color-2) no-repeat 0 0 / cover;
      background: linear-gradient(to right, $bg-color-1, $bg-color-2) no-repeat 0 0 / cover;
      // color: #fff;
      position: relative;
      left: -100%;
      height: 100%;
      width: 200%;
      -webkit-transform: translateY(0);
      -ms-transform: translateY(0);
      transform: translateY(0);
      -webkit-transition: -webkit-transform 0.6s ease-in-out;
      transition: -webkit-transform 0.6s ease-in-out;
      -o-transition: transform 0.6s ease-in-out;
      transition: transform 0.6s ease-in-out;
      transition:
        transform 0.6s ease-in-out,
        -webkit-transform 0.6s ease-in-out;

      &__panel {
        position: absolute;
        top: 0;
        display: -webkit-box;
        display: -ms-flexbox;
        display: flex;
        -webkit-box-orient: vertical;
        -webkit-box-direction: normal;
        -ms-flex-direction: column;
        flex-direction: column;
        -webkit-box-pack: center;
        -ms-flex-pack: center;
        justify-content: center;
        -webkit-box-align: center;
        -ms-flex-align: center;
        align-items: center;
        padding: 0 40px;
        height: 100%;
        width: 50%;
        text-align: center;
        -webkit-transform: translateY(0);
        -ms-transform: translateY(0);
        transform: translateY(0);
        -webkit-transition: -webkit-transform 0.6s ease-in-out;
        transition: -webkit-transform 0.6s ease-in-out;
        -o-transition: transform 0.6s ease-in-out;
        transition: transform 0.6s ease-in-out;
        transition:
          transform 0.6s ease-in-out,
          -webkit-transform 0.6s ease-in-out;

        & h1 {
          // font-size: $font-size-large * 1.5;
          color: white;
        }
      }

      .right {
        right: 0;
        -webkit-transform: translateY(0);
        -ms-transform: translateY(0);
        transform: translateY(0);
      }
      .left {
        -webkit-transform: translateY(0%);
        -ms-transform: translateY(0%);
        transform: translateY(0%);
      }
    }
  }
}

/* Скользящая панель */
.forms.panel-active {
  .overlay-container {
    -webkit-transform: translateX(-100%);
    -ms-transform: translateX(-100%);
    transform: translateX(-100%);
  }

  .overlay {
    -webkit-transform: translateX(50%);
    -ms-transform: translateX(50%);
    transform: translateX(50%);
  }
}

button.ghost {
  // background: transparent;
  // border-color: #fff;
}

/* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */
/* ✨ RESPONSIVENESS ✨ */
/* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */
/* 600px */
@include responsiveness(tablet-portrait) {
}

/* 1200px */
@include responsiveness(desktop) {
}
</style>
