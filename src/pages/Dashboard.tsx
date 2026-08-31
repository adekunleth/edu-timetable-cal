import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Users, BookOpen, AlertCircle, ClipboardCheck, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { AttendanceMarkingDialog } from "@/components/AttendanceMarkingDialog";
import { useRole, CURRENT_STUDENT } from "@/contexts/RoleContext";
import { useAttendanceSettings } from "@/contexts/AttendanceSettingsContext";
import {
  parseTimeToDate,
  getWindowStatus,
  formatFullDate,
  formatHoursRemaining,
  WindowInfo,
} from "@/utils/attendanceWindow";

export default function Dashboard() {
  const { isStudent } = useRole();
  const { windowHours } = useAttendanceSettings();
  const [attendanceDialogOpen, setAttendanceDialogOpen] = useState(false);
  const [selectedClass, setSelectedClass] = useState<any>(null);

  const getClassWindow = (time: string): WindowInfo => {
    const [startStr, endStr] = time.split(" - ");
    const today = new Date();
    return getWindowStatus(
      parseTimeToDate(today, startStr),
      parseTimeToDate(today, endStr),
      windowHours
    );
  };

  const handleMarkAttendance = (cls: any, windowInfo: WindowInfo) => {
    if (windowInfo.status !== "open") return;
    setSelectedClass({
      subject: cls.subject.split(" - ")[0],
      title: cls.subject.split(" - ")[1],
      date: formatFullDate(new Date()),
      time: cls.time,
      room: cls.room,
      windowInfo,
      windowHours,
    });
    setAttendanceDialogOpen(true);
  };

  const adminStats = [
    {
      title: "Active Subjects",
      value: "24",
      icon: BookOpen,
      color: "text-lecture",
    },
    {
      title: "Total Students",
      value: "1,248",
      icon: Users,
      color: "text-tutorial",
    },
    {
      title: "Classes This Week",
      value: "156",
      icon: Calendar,
      color: "text-accent",
    },
    {
      title: "Attendance Rate",
      value: "87%",
      icon: AlertCircle,
      color: "text-workshop",
    },
  ];

  // Students only see figures about their own enrolment — no cohort-wide or
  // institution-wide counts.
  const studentStats = [
    { title: "My Subjects", value: "6", icon: BookOpen, color: "text-lecture" },
    { title: "My Classes This Week", value: "11", icon: Calendar, color: "text-accent" },
    { title: "My Attendance Rate", value: "92%", icon: AlertCircle, color: "text-workshop" },
    { title: "Classes Today", value: "3", icon: Users, color: "text-tutorial" },
  ];

  const stats = isStudent ? studentStats : adminStats;


  const upcomingClasses = [
    {
      subject: "BIO101 - Anatomy Basics",
      time: "9:00 AM - 11:00 AM",
      type: "Lecture",
      room: "Building A - Room 201",
      instructor: "Dr. Nguyen",
      color: "bg-lecture/10 text-lecture border-lecture/20",
    },
    {
      subject: "CHEM202 - Organic Chemistry",
      time: "1:00 PM - 3:00 PM",
      type: "Lab",
      room: "Science Lab 3",
      instructor: "Prof. Smith",
      color: "bg-lab/10 text-lab border-lab/20",
    },
    {
      subject: "MATH301 - Advanced Calculus",
      time: "3:30 PM - 4:30 PM",
      type: "Tutorial",
      room: "Building C - Room 105",
      instructor: "Ms. Johnson",
      color: "bg-tutorial/10 text-tutorial border-tutorial/20",
    },
  ];

  const adminAlerts = [
    {
      message: "Room conflict detected for BIO101 on Thursday 3:00 PM",
      severity: "high",
    },
    {
      message: "Low attendance alert: PHYS202 - Below 80% threshold",
      severity: "medium",
    },
    {
      message: "Holiday scheduled: Mid-semester break starts March 15",
      severity: "low",
    },
  ];

  // Student notices are personal — never operational alerts about other people.
  const studentAlerts = [
    {
      message: "Your PHYS202 attendance is 78% — below the 80% threshold",
      severity: "medium",
    },
    {
      message: "CHEM202 Lab moved to Science Lab 3 this week",
      severity: "low",
    },
    {
      message: "Holiday scheduled: Mid-semester break starts March 15",
      severity: "low",
    },
  ];

  const recentAlerts = isStudent ? studentAlerts : adminAlerts;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-foreground">
            {isStudent ? `Welcome, ${CURRENT_STUDENT.name}` : "Dashboard"}
          </h2>
          <p className="text-muted-foreground">
            {isStudent
              ? `${CURRENT_STUDENT.id} · Academic Year 2025 - Semester 1`
              : "Academic Year 2025 - Semester 1"}
          </p>
        </div>
        <Button>
          <Calendar className="mr-2 h-4 w-4" />
          View Full Calendar
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                {stat.value}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Upcoming Classes */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Today's Schedule</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {upcomingClasses.map((cls, index) => {
              const win = getClassWindow(cls.time);
              return (
                <div
                  key={index}
                  className={`rounded-lg border p-4 ${cls.color}`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-1">
                      <h4 className="font-semibold">{cls.subject}</h4>
                      <p className="text-sm opacity-90">{cls.time}</p>
                      <p className="text-sm opacity-75">{cls.room}</p>
                      <p className="text-sm opacity-75">
                        Instructor: {cls.instructor}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span className="rounded-full px-3 py-1 text-xs font-medium">
                        {cls.type}
                      </span>
                      {!isStudent &&
                        (win.status === "open" ? (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleMarkAttendance(cls, win)}
                            >
                              <ClipboardCheck className="h-4 w-4 mr-2" />
                              Mark Attendance
                            </Button>
                            <span className="text-xs text-muted-foreground">
                              Closes in{" "}
                              {formatHoursRemaining(win.hoursRemaining ?? 0)}
                            </span>
                          </>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            disabled
                            title={
                              win.status === "upcoming"
                                ? "Marking opens when the class starts"
                                : `Marking window closed — class ended more than ${windowHours}h ago`
                            }
                          >
                            <Lock className="h-4 w-4 mr-2" />
                            {win.status === "upcoming"
                              ? "Not open yet"
                              : "Window closed"}
                          </Button>
                        ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Alerts & Notifications */}
        <Card>
          <CardHeader>
            <CardTitle>Alerts & Notifications</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentAlerts.map((alert, index) => (
              <div
                key={index}
                className={`rounded-lg border p-3 ${
                  alert.severity === "high"
                    ? "border-destructive/20 bg-destructive/10"
                    : alert.severity === "medium"
                    ? "border-late/20 bg-late/10"
                    : "border-primary/20 bg-primary/10"
                }`}
              >
                <p className="text-sm">{alert.message}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {selectedClass && (
        <AttendanceMarkingDialog
          open={attendanceDialogOpen}
          onOpenChange={setAttendanceDialogOpen}
          classInfo={selectedClass}
        />
      )}
    </div>
  );
}
