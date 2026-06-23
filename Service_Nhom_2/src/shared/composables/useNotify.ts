import { ref } from 'vue'

interface NotifyState {
  show: boolean
  message: string
  color: string
  icon: string
  timeout: number
}

const state = ref<NotifyState>({
  show: false,
  message: '',
  color: 'success',
  icon: 'mdi-check-circle',
  timeout: 3000,
})

function notify(message: string, color: string, icon: string, timeout: number) {
  state.value = { show: true, message, color, icon, timeout }
}

export function useNotify() {
  return {
    state,
    success: (msg: string) => notify(msg, 'success', 'mdi-check-circle', 3000),
    error: (msg: string) => notify(msg, 'error', 'mdi-alert-circle', 5000),
    info: (msg: string) => notify(msg, 'info', 'mdi-information', 3000),
    warning: (msg: string) => notify(msg, 'warning', 'mdi-alert', 4000),
  }
}
