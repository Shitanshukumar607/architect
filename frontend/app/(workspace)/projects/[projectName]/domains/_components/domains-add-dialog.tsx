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
import { getDomain } from "@/lib/utils"

interface DomainsAddDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: () => void
  isLoading: boolean
  newDomain: string
  onDomainChange: (value: string) => void
  isDisabled: boolean
}

export function DomainsAddDialog({
  open,
  onOpenChange,
  onSubmit,
  isLoading,
  newDomain,
  onDomainChange,
  isDisabled,
}: DomainsAddDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[440px]">
        <DialogHeader>
          <DialogTitle>Add Custom Domain</DialogTitle>
          <DialogDescription>
            Enter the hostname you want to associate with this project.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="hostname">Hostname</Label>
            <Input
              id="hostname"
              placeholder="example.com"
              value={newDomain}
              onChange={(e) => onDomainChange(e.target.value)}
              className="rounded-xl"
            />
            <p className="text-xs text-muted-foreground">
              Use a root domain or subdomain you control.
            </p>
            {newDomain && !newDomain.includes(".") && (
              <p className="text-xs font-medium text-emerald-500">
                Will be available at: {getDomain(newDomain)}
              </p>
            )}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} className="rounded-xl">
            Cancel
          </Button>
          <Button onClick={onSubmit} disabled={isDisabled} className="rounded-xl">
            {isLoading ? "Adding..." : "Add Domain"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
