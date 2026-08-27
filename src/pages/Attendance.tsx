import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle, Clock, AlertCircle } from "lucide-react";
import { ClassFilterBar, FiltersEmptyState } from "@/components/ClassFilterBar";
import { useFilters } from "@/contexts/FiltersContext";
import { COHORTS, getCohortLabel } from "@/constants/dropdownOptions";
import {
  StudentAttendanceDialog,
  StudentAttendanceTarget,
} from "@/components/StudentAttendanceDialog";
import { AttendanceStatus } from "@/utils/studentAttendance";


const baseRecords = [
  { student: "Alice Johnson", id: "S2024001", bio101: "present", math301: "present", phys202: "late", chem202: "present", cs101: "present", eng201: "present", overallRate: "92%" },
  { student: "Bob Smith", id: "S2024002", bio101: "absent", math301: "present", phys202: "present", chem202: "excused", cs101: "present", eng201: "late", overallRate: "75%" },
  { student: "Carol Davis", id: "S2024003", bio101: "present", math301: "present", phys202: "present", chem202: "present", cs101: "present", eng201: "present", overallRate: "100%" },
  { student: "David Lee", id: "S2024004", bio101: "late", math301: "absent", phys202: "present", chem202: "present", cs101: "excused", eng201: "present", overallRate: "70%" },
  { student: "Emma Wilson", id: "S2024005", bio101: "present", math301: "present", phys202: "present", chem202: "late", cs101: "present", eng201: "present", overallRate: "95%" },
  { student: "Frank Martinez", id: "S2024006", bio101: "present", math301: "late", phys202: "present", chem202: "present", cs101: "absent", eng201: "present", overallRate: "85%" },
  { student: "Grace Taylor", id: "S2024007", bio101: "present", math301: "present", phys202: "excused", chem202: "present", cs101: "present", eng201: "present", overallRate: "98%" },
  { student: "Henry Brown", id: "S2024008", bio101: "absent", math301: "absent", phys202: "present", chem202: "present", cs101: "present", eng201: "late", overallRate: "65%" },
  { student: "Ivy Chen", id: "S2024009", bio101: "present", math301: "present", phys202: "present", chem202: "present", cs101: "present", eng201: "present", overallRate: "100%" },
  { student: "Jack Thompson", id: "S2024010", bio101: "late", math301: "present", phys202: "present", chem202: "late", cs101: "present", eng201: "present", overallRate: "88%" },
  { student: "Kelly White", id: "S2024011", bio101: "present", math301: "excused", phys202: "present", chem202: "present", cs101: "present", eng201: "absent", overallRate: "82%" },
  { student: "Liam Garcia", id: "S2024012", bio101: "present", math301: "present", phys202: "late", chem202: "present", cs101: "present", eng201: "present", overallRate: "93%" },
  { student: "Mia Rodriguez", id: "S2024013", bio101: "present", math301: "present", phys202: "present", chem202: "present", cs101: "late", eng201: "present", overallRate: "96%" },
  { student: "Noah Anderson", id: "S2024014", bio101: "absent", math301: "present", phys202: "present", chem202: "excused", cs101: "present", eng201: "present", overallRate: "78%" },
  { student: "Olivia Martinez", id: "S2024015", bio101: "present", math301: "present", phys202: "present", chem202: "present", cs101: "present", eng201: "present", overallRate: "100%" },
  { student: "Peter Kim", id: "S2024016", bio101: "late", math301: "late", phys202: "present", chem202: "present", cs101: "present", eng201: "present", overallRate: "86%" },
  { student: "Quinn Harper", id: "S2024017", bio101: "present", math301: "present", phys202: "absent", chem202: "present", cs101: "excused", eng201: "present", overallRate: "80%" },
  { student: "Rachel Green", id: "S2024018", bio101: "present", math301: "present", phys202: "present", chem202: "late", cs101: "present", eng201: "present", overallRate: "94%" },
  { student: "Sam Patel", id: "S2024019", bio101: "present", math301: "absent", phys202: "present", chem202: "present", cs101: "present", eng201: "late", overallRate: "83%" },
  { student: "Tara Singh", id: "S2024020", bio101: "present", math301: "present", phys202: "present", chem202: "present", cs101: "present", eng201: "present", overallRate: "100%" },
];

// Each student belongs to a cohort so the course/cohort filters have data to
// bite on (CR-001 §9.3). The matrix itself stays static.
const COHORT_CYCLE = COHORTS.map((c) => c.id);
const attendanceRecords = baseRecords.map((r, i) => ({
  ...r,
  cohortId: COHORT_CYCLE[i % COHORT_CYCLE.length],
}));

const SUBJECT_COLUMNS = [
  { code: "BIO101", key: "bio101" as const },
  { code: "MATH301", key: "math301" as const },
  { code: "PHYS202", key: "phys202" as const },
  { code: "CHEM202", key: "chem202" as const },
  { code: "CS101", key: "cs101" as const },
  { code: "ENG201", key: "eng201" as const },
];

export default function Attendance() {
  const { filters } = useFilters();
  const [selected, setSelected] = useState<StudentAttendanceTarget | null>(null);

  const openBreakdown = (record: (typeof attendanceRecords)[number]) =>
    setSelected({
      student: record.student,
      id: record.id,
      cohortLabel: getCohortLabel(record.cohortId),
      subjects: SUBJECT_COLUMNS.map((col) => ({
        code: col.code,
        currentStatus: (record as Record<string, string>)[col.key] as AttendanceStatus,
      })),
    });





  const getAttendanceIcon = (status: string) => {
    switch (status) {
      case "present":
        return <CheckCircle2 className="h-5 w-5 text-present" />;
      case "absent":
        return <XCircle className="h-5 w-5 text-absent" />;
      case "late":
        return <Clock className="h-5 w-5 text-late" />;
      case "excused":
        return <AlertCircle className="h-5 w-5 text-excused" />;
      default:
        return null;
    }
  };

  const cohortCourse = (cohortId: string) =>
    COHORTS.find((c) => c.id === cohortId)?.courseId;

  const filteredRecords = attendanceRecords.filter((r) => {
    const matchesCourse =
      filters.courseId === "all" || cohortCourse(r.cohortId) === filters.courseId;
    const matchesCohort =
      filters.cohortId === "all" ||
      (filters.cohortId === "unassigned" ? false : r.cohortId === filters.cohortId);
    return matchesCourse && matchesCohort;
  });

  const visibleColumns =
    filters.subject === "all"
      ? SUBJECT_COLUMNS
      : SUBJECT_COLUMNS.filter((c) => c.code === filters.subject);

  const hasRows = filteredRecords.length > 0;
  const rates = filteredRecords.map((r) => parseInt(r.overallRate, 10));
  const averageAttendance = hasRows
    ? `${Math.round(rates.reduce((a, b) => a + b, 0) / rates.length)}%`
    : "—";
  const belowThreshold = hasRows ? rates.filter((r) => r < 80).length : "—";
  const perfectAttendance = hasRows ? rates.filter((r) => r === 100).length : "—";
  const lateArrivals = hasRows
    ? filteredRecords.reduce(
        (count, r) =>
          count +
          visibleColumns.filter((c) => (r as Record<string, string>)[c.key] === "late").length,
        0
      )
    : "—";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-foreground">
            Attendance Tracking
          </h2>
          <p className="text-muted-foreground">
            Monitor and manage student attendance
          </p>
        </div>
        <Button>Export Report</Button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Average Attendance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-present">{averageAttendance}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Below Threshold
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{belowThreshold}</div>
            <p className="text-xs text-muted-foreground">Students &lt; 80%</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Perfect Attendance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{perfectAttendance}</div>
            <p className="text-xs text-muted-foreground">Students at 100%</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Late Arrivals
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-late">{lateArrivals}</div>
            <p className="text-xs text-muted-foreground">This week</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="flex flex-wrap items-center gap-4 p-4">
          <ClassFilterBar
            visible={["courseId", "cohortId", "subject"]}
            className="flex-1"
          />
          <select className="rounded-md border border-input bg-background px-3 py-2 text-sm">
            <option>This Week</option>
            <option>Last Week</option>
            <option>This Month</option>
          </select>
        </CardContent>
      </Card>

      {/* Attendance Table */}
      <Card>
        <CardHeader>
          <CardTitle>Attendance Records</CardTitle>
        </CardHeader>
        <CardContent>
          {!hasRows ? (
            <FiltersEmptyState />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="p-3 text-left text-sm font-medium text-muted-foreground">
                      Student
                    </th>
                    <th className="p-3 text-left text-sm font-medium text-muted-foreground">
                      ID
                    </th>
                    <th className="p-3 text-left text-sm font-medium text-muted-foreground">
                      Cohort
                    </th>
                    {visibleColumns.map((col) => (
                      <th
                        key={col.code}
                        className="p-3 text-center text-sm font-medium text-muted-foreground"
                      >
                        {col.code}
                      </th>
                    ))}
                    <th className="p-3 text-left text-sm font-medium text-muted-foreground">
                      Attendance Rate
                    </th>
                    <th className="p-3 text-right text-sm font-medium text-muted-foreground">
                      Breakdown
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRecords.map((record) => (
                    <tr
                      key={record.id}
                      onClick={() => openBreakdown(record)}
                      className="cursor-pointer border-b border-border hover:bg-muted/50"
                    >
                      <td className="p-3 text-sm font-medium text-foreground">
                        {record.student}
                      </td>
                      <td className="p-3 text-sm text-muted-foreground">
                        {record.id}
                      </td>
                      <td className="p-3 text-sm text-muted-foreground">
                        {getCohortLabel(record.cohortId)}
                      </td>
                      {visibleColumns.map((col) => (
                        <td key={col.code} className="p-3 text-center">
                          <div className="flex justify-center">
                            {getAttendanceIcon((record as Record<string, string>)[col.key])}
                          </div>
                        </td>
                      ))}
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                            <div
                              className={`h-full ${
                                parseInt(record.overallRate) >= 80
                                  ? "bg-present"
                                  : "bg-destructive"
                              }`}
                              style={{ width: record.overallRate }}
                            />
                          </div>
                          <span className="text-sm font-medium text-foreground">
                            {record.overallRate}
                          </span>
                        </div>
                      </td>
                      <td className="p-3 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            openBreakdown(record);
                          }}
                        >
                          View
                        </Button>
                      </td>
                    </tr>
                  ))}

                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Legend */}
      <Card>
        <CardContent className="flex gap-6 p-4">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-present" />
            <span className="text-sm text-muted-foreground">Present</span>
          </div>
          <div className="flex items-center gap-2">
            <XCircle className="h-5 w-5 text-absent" />
            <span className="text-sm text-muted-foreground">Absent</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-late" />
            <span className="text-sm text-muted-foreground">Late</span>
          </div>
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-excused" />
            <span className="text-sm text-muted-foreground">Excused</span>
          </div>
        </CardContent>
      </Card>

      <StudentAttendanceDialog
        target={selected}
        onOpenChange={(open) => !open && setSelected(null)}
      />
    </div>

  );
}
