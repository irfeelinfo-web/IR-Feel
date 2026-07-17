"use client"

import { useActionState } from "react"
import { loginAction } from "@/app/admin/actions"

export function LoginForm() {
  const [state, formAction, pending] = useActionState(loginAction, null as { error?: string } | null)

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="password" className="text-sm font-medium text-foreground">
          পাসওয়ার্ড
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          autoFocus
          className="h-11 rounded-lg border border-border bg-background px-3 text-sm text-foreground outline-none focus:border-foreground"
          placeholder="••••••••"
        />
      </div>
      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
      <button
        type="submit"
        disabled={pending}
        className="h-11 rounded-lg bg-primary text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
      >
        {pending ? "লগইন হচ্ছে..." : "লগইন"}
      </button>
    </form>
  )
}
