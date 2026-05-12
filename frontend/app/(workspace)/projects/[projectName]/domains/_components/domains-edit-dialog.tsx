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

interface DomainsEditDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: () => void
  isLoading: boolean
  editHostname: string
  onHostnameChange: (value: string) => void
  isDisabled: boolean
}

export function DomainsEditDialog({
  open,
  onOpenChange,
  onSubmit,
  isLoading,
  editHostname,
  onHostnameChange,
  isDisabled,
}: DomainsEditDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[440px]">
        <DialogHeader>
          <DialogTitle>Edit Domain</DialogTitle>
          <DialogDescription>
            Update the hostname for this domain.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="edit-hostname">Hostname</Label>
            <Input
              id="edit-hostname"
              placeholder="example.com"
              value={editHostname}
              onChange={(e) => onHostnameChange(e.target.value)}
              className="rounded-xl"
            />
            <p className="text-xs text-muted-foreground">
              Changing the hostname may require a new DNS verification.
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} className="rounded-xl">
            Cancel
          </Button>
          <Button onClick={onSubmit} disabled={isDisabled} className="rounded-xl">
            {isLoading ? "Saving..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
