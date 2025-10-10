import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle, Clock, AlertCircle } from "lucide-react";

const attendanceRecords = [
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

export default function Attendance() {
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
            <div className="text-2xl font-bold text-present">87%</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Below Threshold
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">3</div>
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
            <div className="text-2xl font-bold text-foreground">3</div>
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
            <div className="text-2xl font-bold text-late">24</div>
            <p className="text-xs text-muted-foreground">This week</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="flex gap-4 p-4">
          <select className="rounded-md border border-input bg-background px-3 py-2 text-sm">
            <option>All Cohorts</option>
            <option>2025 S1 Intake</option>
            <option>2025 S2 Intake</option>
            <option>International Cohort A</option>
          </select>
          <select className="rounded-md border border-input bg-background px-3 py-2 text-sm">
            <option>All Subjects</option>
            <option>BIO101</option>
            <option>MATH301</option>
            <option>PHYS202</option>
            <option>CHEM202</option>
            <option>CS101</option>
            <option>ENG201</option>
          </select>
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
                  <th className="p-3 text-center text-sm font-medium text-muted-foreground">
                    BIO101
                  </th>
                  <th className="p-3 text-center text-sm font-medium text-muted-foreground">
                    MATH301
                  </th>
                  <th className="p-3 text-center text-sm font-medium text-muted-foreground">
                    PHYS202
                  </th>
                  <th className="p-3 text-center text-sm font-medium text-muted-foreground">
                    CHEM202
                  </th>
                  <th className="p-3 text-center text-sm font-medium text-muted-foreground">
                    CS101
                  </th>
                  <th className="p-3 text-center text-sm font-medium text-muted-foreground">
                    ENG201
                  </th>
                  <th className="p-3 text-left text-sm font-medium text-muted-foreground">
                    Attendance Rate
                  </th>
                </tr>
              </thead>
              <tbody>
                {attendanceRecords.map((record) => (
                  <tr
                    key={record.id}
                    className="border-b border-border hover:bg-muted/50"
                  >
                    <td className="p-3 text-sm font-medium text-foreground">
                      {record.student}
                    </td>
                    <td className="p-3 text-sm text-muted-foreground">
                      {record.id}
                    </td>
                    <td className="p-3 text-center">
                      {getAttendanceIcon(record.bio101)}
                    </td>
                    <td className="p-3 text-center">
                      {getAttendanceIcon(record.math301)}
                    </td>
                    <td className="p-3 text-center">
                      {getAttendanceIcon(record.phys202)}
                    </td>
                    <td className="p-3 text-center">
                      {getAttendanceIcon(record.chem202)}
                    </td>
                    <td className="p-3 text-center">
                      {getAttendanceIcon(record.cs101)}
                    </td>
                    <td className="p-3 text-center">
                      {getAttendanceIcon(record.eng201)}
                    </td>
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
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
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
    </div>
  );
}
