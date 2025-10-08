import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle, Clock, AlertCircle } from "lucide-react";

export default function Attendance() {
  const attendanceRecords = [
    {
      student: "Alice Johnson",
      id: "S2024001",
      bio101: "present",
      chem202: "present",
      math301: "absent",
      phys202: "late",
      rate: "85%",
    },
    {
      student: "Bob Smith",
      id: "S2024002",
      bio101: "present",
      chem202: "excused",
      math301: "present",
      phys202: "present",
      rate: "92%",
    },
    {
      student: "Carol Williams",
      id: "S2024003",
      bio101: "late",
      chem202: "present",
      math301: "present",
      phys202: "absent",
      rate: "78%",
    },
    {
      student: "David Brown",
      id: "S2024004",
      bio101: "present",
      chem202: "present",
      math301: "present",
      phys202: "present",
      rate: "100%",
    },
  ];

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
            <div className="text-2xl font-bold text-foreground">12</div>
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
            <option>Nursing 2025</option>
            <option>Science 2024</option>
          </select>
          <select className="rounded-md border border-input bg-background px-3 py-2 text-sm">
            <option>All Subjects</option>
            <option>BIO101</option>
            <option>CHEM202</option>
            <option>MATH301</option>
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
                    CHEM202
                  </th>
                  <th className="p-3 text-center text-sm font-medium text-muted-foreground">
                    MATH301
                  </th>
                  <th className="p-3 text-center text-sm font-medium text-muted-foreground">
                    PHYS202
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
                      {getAttendanceIcon(record.chem202)}
                    </td>
                    <td className="p-3 text-center">
                      {getAttendanceIcon(record.math301)}
                    </td>
                    <td className="p-3 text-center">
                      {getAttendanceIcon(record.phys202)}
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                          <div
                            className={`h-full ${
                              parseInt(record.rate) >= 80
                                ? "bg-present"
                                : "bg-destructive"
                            }`}
                            style={{ width: record.rate }}
                          />
                        </div>
                        <span className="text-sm font-medium text-foreground">
                          {record.rate}
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
