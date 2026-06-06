"use client";

import { useRouter } from "next/navigation";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { createOrderSchema } from "@/lib/schemas";
import { useUsername } from "@/lib/use-username";
import { postJSON } from "@/lib/api";
import type { Order } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

// The form owns everything except received_by, which comes from the username.
const formSchema = createOrderSchema.omit({ received_by: true });
type FormValues = z.input<typeof formSchema>;

export default function CreateOrderPage() {
  const router = useRouter();
  const { username } = useUsername();

  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      customer_name: "",
      customer_phone: "",
      address: "",
      note: "",
      items: [{ name: "", quantity: 1, price: 0 }],
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: "items" });

  async function onSubmit(values: FormValues) {
    if (!username) {
      toast.error("Set your name first (top right) so we know who took this.");
      return;
    }
    try {
      await postJSON<{ order: Order }>("/api/create", {
        ...values,
        received_by: username,
      });
      toast.success("Order created");
      router.push("/");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not create order");
    }
  }

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-1 text-2xl font-semibold">New order</h1>
      <p className="mb-6 text-sm text-muted-foreground">
        Taken by <span className="font-medium">{username || "— set your name first"}</span>.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <section className="space-y-4 rounded-lg border bg-card p-4">
          <div className="grid gap-2">
            <Label htmlFor="customer_name">Customer name</Label>
            <Input id="customer_name" {...register("customer_name")} />
            {errors.customer_name && (
              <p className="text-sm text-destructive">
                {errors.customer_name.message}
              </p>
            )}
          </div>

          <div className="grid gap-2 sm:grid-cols-2 sm:gap-4">
            <div className="grid gap-2">
              <Label htmlFor="customer_phone">Phone (optional)</Label>
              <Input id="customer_phone" {...register("customer_phone")} />
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="address">Address</Label>
            <Input id="address" {...register("address")} />
            {errors.address && (
              <p className="text-sm text-destructive">
                {errors.address.message}
              </p>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="note">Note (optional)</Label>
            <Textarea
              id="note"
              placeholder="e.g. extra pineapple, ring twice"
              {...register("note")}
            />
          </div>
        </section>

        <section className="space-y-3 rounded-lg border bg-card p-4">
          <div className="flex items-center justify-between">
            <h2 className="font-medium">Pizzas</h2>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => append({ name: "", quantity: 1, price: 0 })}
              className="gap-1"
            >
              <Plus className="size-4" /> Add
            </Button>
          </div>

          {errors.items?.message && (
            <p className="text-sm text-destructive">{errors.items.message}</p>
          )}

          <div className="space-y-3">
            {fields.map((field, index) => (
              <div key={field.id} className="flex items-end gap-2">
                <div className="grid flex-1 gap-1">
                  {index === 0 && (
                    <Label className="text-xs text-muted-foreground">Name</Label>
                  )}
                  <Input
                    placeholder="Margherita"
                    {...register(`items.${index}.name`)}
                  />
                </div>
                <div className="grid w-20 gap-1">
                  {index === 0 && (
                    <Label className="text-xs text-muted-foreground">Qty</Label>
                  )}
                  <Input
                    type="number"
                    min={1}
                    {...register(`items.${index}.quantity`, {
                      valueAsNumber: true,
                    })}
                  />
                </div>
                <div className="grid w-24 gap-1">
                  {index === 0 && (
                    <Label className="text-xs text-muted-foreground">
                      Price €
                    </Label>
                  )}
                  <Input
                    type="number"
                    min={0}
                    step="0.01"
                    {...register(`items.${index}.price`, {
                      valueAsNumber: true,
                    })}
                  />
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  disabled={fields.length === 1}
                  onClick={() => remove(index)}
                  aria-label="Remove pizza"
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            ))}
          </div>
        </section>

        <div className="flex items-center gap-3">
          <Button type="submit" disabled={isSubmitting || !username}>
            {isSubmitting ? "Creating…" : "Create order"}
          </Button>
          {!username && (
            <span className="text-sm text-muted-foreground">
              Set your name (top right) to enable.
            </span>
          )}
        </div>
      </form>
    </div>
  );
}
