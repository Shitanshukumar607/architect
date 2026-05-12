"use client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface EnvVarsAddDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: () => void
  isLoading: boolean
  newKey: string
  newValue: string
  onKeyChange: (value: string) => void
  onValueChange: (value: string) => void
}

export function EnvVarsAddDialog({
  open,
  onOpenChange,
  onSubmit,
  isLoading,
  newKey,
  newValue,
  onKeyChange,
  onValueChange,
}: EnvVarsAddDialogProps) {
  const isDisabled =
    isLoading || newKey.trim().length === 0 || newValue.trim().length === 0

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[440px]">
        <DialogHeader>
          <DialogTitle>Add Environment Variable</DialogTitle>
          <DialogDescription>
            Create a new key-value pair for this project.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="env-key">Key</Label>
            <Input
              id="env-key"
              placeholder="SUPER_SECRET_KEY"
              value={newKey}
              onChange={(event) => onKeyChange(event.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="env-value">Value</Label>
            <Input
              id="env-value"
              type="password"
              placeholder="********"
              value={newValue}
              onChange={(event) => onValueChange(event.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={onSubmit} disabled={isDisabled}>
            {isLoading ? "Adding..." : "Add Variable"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
