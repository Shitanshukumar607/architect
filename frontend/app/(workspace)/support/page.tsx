"use client"

import { useEffect, useState, FormEvent } from "react"
import { useSession } from "@/lib/auth-client"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Loader2, Mail, Send, CheckCircle2 } from "lucide-react"
import { sendSupportEmail } from "./actions"

export default function SupportPage() {
  const { data: session } = useSession()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [category, setCategory] = useState("general")
  const [subject, setSubject] = useState("")
  const [message, setMessage] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  useEffect(() => {
    if (session?.user) {
      if (session.user.email) setEmail(session.user.email)
      if (session.user.name) setName(session.user.name)
    }
  }, [session])

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!email || !subject || !message) {
      toast.error("Please fill in all required fields.")
      return
    }

    setIsSubmitting(true)

    try {
      const response = await sendSupportEmail({
        name,
        email,
        category,
        subject,
        message,
      })

      if (response.success) {
        toast.success("Support ticket sent successfully!")
        setIsSuccess(true)
        setSubject("")
        setMessage("")
      } else {
        toast.error(response.error || "Failed to send email. Please try again.")
      }
    } catch (err) {
      console.error(err)
      toast.error("An unexpected error occurred. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="mx-auto w-full max-w-2xl animate-in space-y-8 px-4 py-8 duration-500 fade-in md:py-12">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
          Support
        </h1>
        <p className="text-sm text-muted-foreground">
          Have a question or run into an issue? Contact our team for assistance.
        </p>
      </div>

      <hr className="border-border" />

      {isSuccess ? (
        <Card className="space-y-6 border-border bg-background/50 p-6 text-center shadow-none backdrop-blur-md">
          <div className="flex justify-center">
            <div className="rounded-full bg-emerald-500/10 p-3 text-emerald-500">
              <CheckCircle2 className="h-8 w-8" />
            </div>
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-bold text-foreground">Message Sent!</h2>
            <p className="mx-auto max-w-md text-sm text-muted-foreground">
              Thank you for contacting Architect Support. We've received your
              request and our team will get back to you at{" "}
              <span className="font-semibold text-foreground">{email}</span>{" "}
              within 24 hours.
            </p>
          </div>
          <Button
            onClick={() => setIsSuccess(false)}
            variant="outline"
            className="rounded-lg"
          >
            Submit another request
          </Button>
        </Card>
      ) : (
        <Card className="border-border bg-background/50 shadow-none backdrop-blur-md">
          <CardHeader>
            <CardTitle className="text-lg font-bold">Submit a Ticket</CardTitle>
            <CardDescription className="text-xs">
              Provide the details below and we will investigate as soon as
              possible.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label
                    htmlFor="name"
                    className="text-xs font-semibold text-muted-foreground"
                  >
                    Name
                  </Label>
                  <Input
                    id="name"
                    placeholder="Your Name (Optional)"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="h-10 bg-background/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="email"
                    className="text-xs font-semibold text-muted-foreground"
                  >
                    Email <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="h-10 bg-background/50"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="category"
                  className="text-xs font-semibold text-muted-foreground"
                >
                  Category
                </Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger
                    id="category"
                    className="h-10 w-full justify-between bg-background/50"
                  >
                    <SelectValue placeholder="Select Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">General Inquiry</SelectItem>
                    <SelectItem value="technical">Technical Support</SelectItem>
                    <SelectItem value="bug">Bug Report</SelectItem>
                    <SelectItem value="feature">Feature Request</SelectItem>
                    <SelectItem value="billing">Billing Inquiry</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="subject"
                  className="text-xs font-semibold text-muted-foreground"
                >
                  Subject <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="subject"
                  placeholder="What can we help you with?"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  required
                  className="h-10 bg-background/50"
                />
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="message"
                  className="text-xs font-semibold text-muted-foreground"
                >
                  Message <span className="text-destructive">*</span>
                </Label>
                <Textarea
                  id="message"
                  placeholder="Describe your issue or question in detail..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required
                  rows={5}
                  className="min-h-32 bg-background/50"
                />
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="h-10 w-full font-semibold"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending Request...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Send Support Message
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Helpful links */}
      <div className="space-y-3 rounded-xl border border-border bg-muted/20 p-4">
        <h3 className="flex items-center gap-2 text-sm font-bold text-foreground">
          <Mail className="h-4 w-4 text-primary" />
          Alternative Contact Info
        </h3>
        <p className="text-xs leading-relaxed text-muted-foreground">
          You can also reach us directly via email at{" "}
          <span className="font-semibold text-foreground">
            shitanshukumar639@gmail.com
          </span>
          . For urgent inquiries, please specify the project ID and deployment
          ID in your email.
        </p>
      </div>
    </div>
  )
}
