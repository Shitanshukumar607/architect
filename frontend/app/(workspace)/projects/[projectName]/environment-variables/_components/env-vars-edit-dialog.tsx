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

interface EnvVarsEditDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: () => void
  isLoading: boolean
  editKey: string
  editValue: string
  onKeyChange: (value: string) => void
  onValueChange: (value: string) => void
}

export function EnvVarsEditDialog({
  open,
  onOpenChange,
  onSubmit,
  isLoading,
  editKey,
  editValue,
  onKeyChange,
  onValueChange,
}: EnvVarsEditDialogProps) {
  const isDisabled =
    isLoading || editKey.trim().length === 0 || editValue.trim().length === 0

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[440px]">
        <DialogHeader>
          <DialogTitle>Edit Environment Variable</DialogTitle>
          <DialogDescription>
            Update the key or value for this variable.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="edit-key">Key</Label>
            <Input
              id="edit-key"
              value={editKey}
              onChange={(event) => onKeyChange(event.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="edit-value">Value</Label>
            <Input
              id="edit-value"
              type="password"
              value={editValue}
              onChange={(event) => onValueChange(event.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={onSubmit} disabled={isDisabled}>
            {isLoading ? "Saving..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
