import type { Env } from './index'

export type AuthenticatedEnv = {
  Bindings: Env
  Variables: {
    userAddress: string
  }
}
