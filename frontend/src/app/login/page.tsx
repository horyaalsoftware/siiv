import { LoginForm } from "@/components/auth/login-form"

export default function LoginPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 p-4 transition-colors duration-300">
      <div className="absolute top-0 z-[-1] h-full w-full bg-white dark:bg-black">
        <div className="absolute bottom-auto left-auto right-0 top-0 h-[500px] w-[500px] -translate-x-[30%] translate-y-[20%] rounded-full bg-[rgba(173,109,244,0.1)] blur-[80px]"></div>
      </div>
      
      <div className="z-10 w-full max-w-md">
        <div className="mb-8 flex flex-col items-center space-y-2">
           <div className="h-12 w-12 rounded-xl bg-primary flex items-center justify-center text-primary-foreground font-bold text-2xl shadow-lg ring ring-primary/20">
             S
           </div>
           <h1 className="text-3xl font-extrabold tracking-tight">Siiv</h1>
        </div>
        <LoginForm />
      </div>
    </main>
  )
}
