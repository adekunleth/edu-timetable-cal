import { useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, Clock, AlertCircle, TrendingDown } from "lucide-react";
import {
  AttendanceStatus,
  RangeKey,
  buildBreakdown,
  formatSessionDate,
} from "@/utils/studentAttendance";

export interface StudentAttendanceTarget {
  student: string;
  id: string;
  cohortLabel: string;
  subjects: { code: string; currentStatus?: AttendanceStatus }[];
}

const STATUS_ICON: Record<AttendanceStatus, JSX.Element> = {
  present: <CheckCircle2 className="h-4 w-4 text-present" />,
  absent: <XCircle className="h-4 w-4 text-absent" />,
  late: <Clock className="h-4 w-4 text-late" />,
  excused: <AlertCircle className="h-4 w-4 text-excused" />,
};

const THRESHOLD = 80;

interface Props {
  target: StudentAttendanceTarget | null;
  onOpenChange: (open: boolean) => void;
}

export function StudentAttendanceDialog({ target, onOpenChange }: Props) {
  const [range, setRange] = useState<RangeKey>("month");
  const [subjectFilter, setSubjectFilter] = useState<string>("all");

  const breakdown = useMemo(
    () => (target ? buildBreakdown(target.id, target.subjects, range) : []),
    [target, range]
  );

  const visible = useMemo(
    () => (subjectFilter === "all" ? breakdown : breakdown.filter((b) => b.subject === subjectFilter)),
    [breakdown, subjectFilter]
  );

  const overall = useMemo(() => {
    const total = breakdown.reduce((a, b) => a + b.total, 0);
    const attended = breakdown.reduce((a, b) => a + b.present + b.late + b.excused, 0);
    return total ? Math.round((attended / total) * 100) : 0;
  }, [breakdown]);

  const atRisk = breakdown.filter((b) => b.rate < THRESHOLD);

  return (
    <Dialog open={!!target} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-3xl overflow-hidden">
        {target && (
          <>
            <DialogHeader>
              <DialogTitle>{target.student}</DialogTitle>
              <DialogDescription>
                {target.id} · {target.cohortLabel} · Attendance breakdown by subject
              </DialogDescription>
            </DialogHeader>

            <div className="flex flex-wrap items-center gap-3">
              <Select value={range} onValueChange={(v) => setRange(v as RangeKey)}>
                <SelectTrigger className="w-[190px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="month">Past month</SelectItem>
                  <SelectItem value="semester">Entire semester</SelectItem>
                </SelectContent>
              </Select>

              <Select value={subjectFilter} onValueChange={setSubjectFilter}>
                <SelectTrigger className="w-[170px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All subjects</SelectItem>
                  {breakdown.map((b) => (
                    <SelectItem key={b.subject} value={b.subject}>
                      {b.subject}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <div className="ml-auto flex items-center gap-3 text-sm">
                <span className="text-muted-foreground">Overall</span>
                <span
                  className={`text-xl font-bold ${
                    overall >= THRESHOLD ? "text-present" : "text-destructive"
                  }`}
                >
                  {overall}%
                </span>
              </div>
            </div>

            {atRisk.length > 0 && (
              <div className="flex items-start gap-2 rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm">
                <TrendingDown className="mt-0.5 h-4 w-4 text-destructive" />
                <span className="text-foreground">
                  Below {THRESHOLD}% in{" "}
                  <span className="font-medium">{atRisk.map((b) => b.subject).join(", ")}</span>{" "}
                  despite an overall rate of {overall}%.
                </span>
              </div>
            )}

            <ScrollArea className="max-h-[52vh] pr-3">
              <div className="space-y-5">
                {visible.map((b) => (
                  <div key={b.subject} className="rounded-lg border border-border p-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-foreground">{b.subject}</span>
                        {b.rate < THRESHOLD && (
                          <Badge variant="destructive">At risk</Badge>
                        )}
                      </div>
                      <span
                        className={`text-lg font-bold ${
                          b.rate >= THRESHOLD ? "text-present" : "text-destructive"
                        }`}
                      >
                        {b.rate}%
                      </span>
                    </div>

                    <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted">
                      <div
                        className={`h-full ${b.rate >= THRESHOLD ? "bg-present" : "bg-destructive"}`}
                        style={{ width: `${b.rate}%` }}
                      />
                    </div>

                    <div className="mt-3 flex flex-wrap gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        {STATUS_ICON.present} {b.present} present
                      </span>
                      <span className="flex items-center gap-1">
                        {STATUS_ICON.late} {b.late} late
                      </span>
                      <span className="flex items-center gap-1">
                        {STATUS_ICON.excused} {b.excused} excused
                      </span>
                      <span className="flex items-center gap-1">
                        {STATUS_ICON.absent} {b.absent} absent
                      </span>
                      <span>{b.total} sessions</span>
                    </div>

                    <div className="mt-4 space-y-1">
                      {b.sessions.map((s, i) => (
                        <div
                          key={`${s.date}-${i}`}
                          className="flex items-center gap-3 rounded px-2 py-1 text-sm hover:bg-muted/50"
                        >
                          {STATUS_ICON[s.status]}
                          <span className="w-32 text-muted-foreground">
                            {formatSessionDate(s.date)}
                          </span>
                          <span className="w-20 text-muted-foreground">{s.type}</span>
                          <span className="capitalize text-foreground">{s.status}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
