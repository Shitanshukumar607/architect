"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"
import { authClient } from "@/lib/auth-client"

export default function SignUpPage() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSignUp = async () => {
    if (!name || !email || !password) {
      toast.error("Please fill in all fields")
      return
    }

    if (password.length < 8) {
      toast.error("Password must be at least 8 characters")
      return
    }

    setIsLoading(true)

    await authClient.signUp.email({
      name,
      email,
      password,
      callbackURL: "/",
    }, {
      onSuccess: () => {
        toast.success("Account created successfully!")
        router.push("/")
      },
      onError: (ctx) => {
        toast.error(ctx.error.message || "Failed to create account")
      },
    })

    setIsLoading(false)
  }

  return (
    <div className="flex min-h-svh items-center justify-center bg-background p-6">
      <Card className="w-full max-w-sm rounded-lg border-border shadow-none">
        <CardHeader className="space-y-1">
          <CardTitle className="text-xl font-semibold tracking-tight">Create Account</CardTitle>
          <CardDescription>
            Sign up to start deploying your projects.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              type="text"
              placeholder="Your name"
              className="h-10 border-input bg-background px-3 focus:outline-none focus:ring-1 focus:ring-ring"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isLoading}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              className="h-10 border-input bg-background px-3 focus:outline-none focus:ring-1 focus:ring-ring"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="Min. 8 characters"
              className="h-10 border-input bg-background px-3 focus:outline-none focus:ring-1 focus:ring-ring"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
            />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-3">
          <Button
            className="w-full font-medium"
            onClick={handleSignUp}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating account...
              </>
            ) : (
              "Sign Up"
            )}
          </Button>
          <p className="text-sm text-muted-foreground">
            Already have an account?{" "}
            <a href="/sign-in" className="text-primary underline-offset-4 hover:underline">
              Sign in
            </a>
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}
