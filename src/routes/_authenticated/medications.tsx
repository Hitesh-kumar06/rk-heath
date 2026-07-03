import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Plus, Trash2, MessageSquare } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/medications")({
  component: MedsPage,
});

function MedsPage() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", dosage: "", time_of_day: "", phone: "", notes: "" });

  const { data: meds = [] } = useQuery({
    queryKey: ["medications"],
    queryFn: async () => {
      const { data, error } = await supabase.from("medications").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const create = useMutation({
    mutationFn: async () => {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) throw new Error("Not signed in");
      const { error } = await supabase.from("medications").insert({ ...form, user_id: u.user.id });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Medication added");
      setOpen(false);
      setForm({ name: "", dosage: "", time_of_day: "", phone: "", notes: "" });
      qc.invalidateQueries({ queryKey: ["medications"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const toggle = useMutation({
    mutationFn: async (m: { id: string; active: boolean }) => {
      const { error } = await supabase.from("medications").update({ active: !m.active }).eq("id", m.id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["medications"] }),
  });

  const del = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("medications").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Removed");
      qc.invalidateQueries({ queryKey: ["medications"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Medications</h1>
          <p className="text-muted-foreground">Track doses and reminder times.</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 mr-1" /> Add</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>New medication</DialogTitle></DialogHeader>
            <div className="grid gap-3">
              <Field label="Medicine name"><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></Field>
              <Field label="Dosage"><Input value={form.dosage} onChange={(e) => setForm({ ...form, dosage: e.target.value })} placeholder="e.g. 500mg, 1 tablet" /></Field>
              <Field label="Time"><Input value={form.time_of_day} onChange={(e) => setForm({ ...form, time_of_day: e.target.value })} placeholder="e.g. 8:00 AM, After dinner" /></Field>
              <Field label="Phone (optional, for SMS)"><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+1 555 555 5555" /></Field>
              <Field label="Notes"><Textarea rows={2} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></Field>
            </div>
            <DialogFooter>
              <Button onClick={() => create.mutate()} disabled={create.isPending}>
                {create.isPending ? "Saving…" : "Save"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-3">
        {meds.map((m) => (
          <Card key={m.id}>
            <CardHeader className="flex flex-row items-start justify-between gap-4">
              <div>
                <CardTitle className="text-lg">{m.name}</CardTitle>
                <CardDescription>{m.dosage} · {m.time_of_day}</CardDescription>
                {m.phone && (
                  <div className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                    <MessageSquare className="h-3 w-3" /> SMS to {m.phone} (reminders coming soon)
                  </div>
                )}
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  Active <Switch checked={m.active} onCheckedChange={() => toggle.mutate({ id: m.id, active: m.active })} />
                </div>
                <Button size="sm" variant="ghost" onClick={() => del.mutate(m.id)}><Trash2 className="h-4 w-4" /></Button>
              </div>
            </CardHeader>
            {m.notes && <CardContent className="text-sm text-muted-foreground">{m.notes}</CardContent>}
          </Card>
        ))}
        {meds.length === 0 && (
          <Card><CardContent className="p-8 text-center text-muted-foreground">No medications yet.</CardContent></Card>
        )}
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (<div className="space-y-1"><Label>{label}</Label>{children}</div>);
}
