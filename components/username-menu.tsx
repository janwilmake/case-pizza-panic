"use client";

import { useEffect, useState } from "react";
import { UserRound } from "lucide-react";
import { useUsername } from "@/lib/use-username";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function UsernameMenu() {
  const { username, setUsername } = useUsername();
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState("");
  // Avoid hydration mismatch: localStorage is only read after mount.
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  // Nudge the operator to identify themselves on first use.
  useEffect(() => {
    if (mounted && !username) setOpen(true);
  }, [mounted, username]);

  function openDialog() {
    setDraft(username);
    setOpen(true);
  }

  function save() {
    if (!draft.trim()) return;
    setUsername(draft);
    setOpen(false);
  }

  return (
    <>
      <Button
        variant={mounted && !username ? "default" : "outline"}
        size="sm"
        onClick={openDialog}
        className="gap-2"
      >
        <UserRound className="size-4" />
        {!mounted ? "…" : username || "Set your name"}
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Who are you?</DialogTitle>
            <DialogDescription>
              Your name is saved on this device and recorded on every order you
              take or move, so Tony knows who to talk to.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-2">
            <Label htmlFor="username">Your name</Label>
            <Input
              id="username"
              value={draft}
              autoFocus
              placeholder="e.g. Sofia"
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && save()}
            />
          </div>
          <DialogFooter>
            <Button onClick={save} disabled={!draft.trim()}>
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
