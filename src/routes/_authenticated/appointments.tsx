import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter,
} from "@/components/ui/dialog";
import { Plus, Calendar as CalendarIcon, Sparkles, Trash2, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { googleCalendarLink } from "@/lib/calendar";
import { generateAppointmentSummary } from "@/lib/summaries.functions";

export const Route = createFileRoute("/_authenticated/appointments")({
  component: AppointmentsPage,
});

function AppointmentsPage() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    patient_name: "",
    doctor_name: "",
    title: "",
    scheduled_at: "",
    notes: "",
  });

  const { data: appts = [], isLoading } = useQuery({
    queryKey: ["appointments"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("appointments").select("*").order("scheduled_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const create = useMutation({
    mutationFn: async () => {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) throw new Error("Not signed in");
      const { error } = await supabase.from("appointments").insert({
        ...form,
        user_id: u.user.id,
        scheduled_at: new Date(form.scheduled_at).toISOString(),
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Appointment saved");
      setOpen(false);
      setForm({ patient_name: "", doctor_name: "", title: "", scheduled_at: "", notes: "" });
      qc.invalidateQueries({ queryKey: ["appointments"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const del = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("appointments").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Deleted");
      qc.invalidateQueries({ queryKey: ["appointments"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });

  const summarizeFn = useServerFn(generateAppointmentSummary);
  const summarize = useMutation({
    mutationFn: (appointmentId: string) => summarizeFn({ data: { appointmentId } }),
    onSuccess: () => {
      toast.success("AI summary ready");
      qc.invalidateQueries({ queryKey: ["dashboard"] });
      qc.invalidateQueries({ queryKey: ["summaries"] });
    },
    onError: (e: Error) => toast.error(e.message ?? "Failed to generate summary"),
  });

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Appointments</h1>
          <p className="text-muted-foreground">Track doctor visits and add them to your calendar.</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 mr-1" /> New</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>New appointment</DialogTitle></DialogHeader>
            <div className="grid gap-3">
              <Field label="Patient name">
                <Input value={form.patient_name} onChange={(e) => setForm({ ...form, patient_name: e.target.value })} />
              </Field>
              <Field label="Doctor">
                <Input value={form.doctor_name} onChange={(e) => setForm({ ...form, doctor_name: e.target.value })} />
              </Field>
              <Field label="Visit title">
                <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. Annual physical" />
              </Field>
              <Field label="Date & time">
                <Input type="datetime-local" value={form.scheduled_at} onChange={(e) => setForm({ ...form, scheduled_at: e.target.value })} />
              </Field>
              <Field label="Notes">
                <Textarea rows={3} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
              </Field>
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
        {isLoading && <p className="text-muted-foreground">Loading…</p>}
        {appts.map((a) => (
          <Card key={a.id}>
            <CardHeader className="flex flex-row items-start justify-between gap-4">
              <div>
                <CardTitle className="text-lg">{a.title}</CardTitle>
                <CardDescription>
                  {a.patient_name} · Dr. {a.doctor_name} · {format(new Date(a.scheduled_at), "PPp")}
                </CardDescription>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button size="sm" variant="outline" asChild>
                  <a
                    href={googleCalendarLink({
                      title: a.title,
                      start: a.scheduled_at,
                      details: `Doctor: ${a.doctor_name}\n${a.notes ?? ""}`,
                    })}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <CalendarIcon className="h-4 w-4 mr-1" /> Calendar <ExternalLink className="h-3 w-3 ml-1" />
                  </a>
                </Button>
                <Button size="sm" variant="secondary" onClick={() => summarize.mutate(a.id)} disabled={summarize.isPending}>
                  <Sparkles className="h-4 w-4 mr-1" /> AI summary
                </Button>
                <Button size="sm" variant="ghost" onClick={() => del.mutate(a.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            {a.notes && <CardContent className="text-sm text-muted-foreground whitespace-pre-wrap">{a.notes}</CardContent>}
          </Card>
        ))}
        {!isLoading && appts.length === 0 && (
          <Card><CardContent className="p-8 text-center text-muted-foreground">No appointments yet. Create your first one.</CardContent></Card>
        )}
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <Label>{label}</Label>
      {children}
    </div>
  );
}
