import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Plus, ClipboardCheck, CalendarDays, List } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AttendanceMarkingDialog } from "@/components/AttendanceMarkingDialog";
import { useClasses } from "@/contexts/ClassesContext";
import { ClassListTable } from "@/components/ClassListTable";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function CalendarView() {
  const navigate = useNavigate();
  const { classes } = useClasses();
  const [currentDate] = useState(new Date(2025, 2, 10)); // March 10, 2025
  const [viewMode, setViewMode] = useState<"calendar" | "list">("calendar");
  const [attendanceDialogOpen, setAttendanceDialogOpen] = useState(false);
  const [selectedClass, setSelectedClass] = useState<any>(null);

  const handleMarkAttendance = (cls: any) => {
    setSelectedClass({
      subject: cls.subject,
      title: cls.title,
      date: "March 10, 2025",
      time: "9:00 AM - 11:00 AM",
      room: cls.room,
    });
    setAttendanceDialogOpen(true);
  };

  const weekDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
  const timeSlots = [
    "8:00 AM",
    "9:00 AM",
    "10:00 AM",
    "11:00 AM",
    "12:00 PM",
    "1:00 PM",
    "2:00 PM",
    "3:00 PM",
    "4:00 PM",
    "5:00 PM",
  ];

  // Convert classes to schedule format for calendar view
  const schedule = classes.flatMap((cls) =>
    cls.sessions.map((session) => {
      // Convert time to slot index
      const startHour = parseInt(session.startTime.split(":")[0]);
      const startTimeIndex = startHour - 8; // 8:00 AM is index 0
      
      const endHour = parseInt(session.endTime.split(":")[0]);
      const duration = endHour - startHour;

      return {
        day: session.day,
        startTime: startTimeIndex,
        duration,
        subject: cls.subject,
        title: cls.title,
        type: session.deliveryType,
        room: session.deliveryMethod === "Online" ? "Online" : session.room || "",
        color: cls.color,
        classId: cls.id,
      };
    })
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-foreground">
            Class Schedule
          </h2>
          <p className="text-muted-foreground">Week View - March 10-14, 2025</p>
        </div>
        <div className="flex items-center gap-2">
          <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as "calendar" | "list")}>
            <TabsList>
              <TabsTrigger value="calendar" className="gap-2">
                <CalendarDays className="h-4 w-4" />
                Calendar
              </TabsTrigger>
              <TabsTrigger value="list" className="gap-2">
                <List className="h-4 w-4" />
                List
              </TabsTrigger>
            </TabsList>
          </Tabs>
          {viewMode === "calendar" && (
            <>
              <Button variant="outline" size="icon">
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline">Today</Button>
              <Button variant="outline" size="icon">
                <ChevronRight className="h-4 w-4" />
              </Button>
            </>
          )}
          <Button className="ml-4" onClick={() => navigate("/calendar/add-class")}>
            <Plus className="mr-2 h-4 w-4" />
            Add Class
          </Button>
        </div>
      </div>

      {viewMode === "calendar" && (
        <>
          {/* Legend */}
          <div className="flex flex-wrap gap-4">
            {[
              { type: "Lecture", color: "bg-lecture" },
              { type: "Lab", color: "bg-lab" },
              { type: "Tutorial", color: "bg-tutorial" },
              { type: "Workshop", color: "bg-workshop" },
              { type: "Online", color: "bg-online" },
            ].map((item) => (
              <div key={item.type} className="flex items-center gap-2">
                <div className={`h-3 w-3 rounded ${item.color}`} />
                <span className="text-sm text-muted-foreground">{item.type}</span>
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <div className="min-w-[800px]">
              {/* Header Row */}
              <div className="grid grid-cols-6 border-b border-border bg-muted/50">
                <div className="border-r border-border p-4">
                  <span className="text-sm font-medium text-muted-foreground">
                    Time
                  </span>
                </div>
                {weekDays.map((day, index) => (
                  <div key={day} className="border-r border-border p-4 last:border-r-0">
                    <div className="text-sm font-medium text-foreground">
                      {day}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Mar {10 + index}
                    </div>
                  </div>
                ))}
              </div>

              {/* Time Slots */}
              <div className="relative">
                {timeSlots.map((time, timeIndex) => (
                  <div
                    key={time}
                    className="grid grid-cols-6 border-b border-border"
                  >
                    <div className="border-r border-border p-4">
                      <span className="text-sm text-muted-foreground">
                        {time}
                      </span>
                    </div>
                    {weekDays.map((_, dayIndex) => (
                      <div
                        key={`${dayIndex}-${timeIndex}`}
                        className="relative border-r border-border p-2 last:border-r-0"
                        style={{ minHeight: "80px" }}
                      >
                        {schedule
                          .filter(
                            (s) =>
                              s.day === dayIndex && s.startTime === timeIndex
                          )
                          .map((cls, idx) => (
                            <div
                              key={idx}
                              className={`absolute inset-x-2 rounded-lg border-l-4 p-2 ${cls.color} group cursor-pointer hover:shadow-md transition-shadow`}
                              style={{
                                height: `${cls.duration * 80 - 8}px`,
                              }}
                            >
                              <div className="text-xs font-semibold">
                                {cls.subject}
                              </div>
                              <div className="text-xs opacity-90">
                                {cls.title}
                              </div>
                              <div className="mt-1 text-xs opacity-75">
                                {cls.room}
                              </div>
                              <Button
                                size="sm"
                                variant="secondary"
                                className="absolute bottom-2 right-2 h-6 px-2 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={() => handleMarkAttendance(cls)}
                              >
                                <ClipboardCheck className="h-3 w-3 mr-1" />
                                Mark
                              </Button>
                            </div>
                          ))}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
        </>
      )}

      {viewMode === "list" && <ClassListTable />}

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
