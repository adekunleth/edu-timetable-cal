import { useState } from "react";
import { useClasses } from "@/contexts/ClassesContext";
import { useFilters } from "@/contexts/FiltersContext";
import { filterClasses } from "@/utils/classFilters";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ClipboardCheck, Pencil, Trash2, CheckCircle2, XCircle } from "lucide-react";
import { AttendanceMarkingDialog } from "./AttendanceMarkingDialog";
import { FiltersEmptyState } from "./ClassFilterBar";
import { ClassSchedule } from "@/types/classForm";
import { getCohortLabel, getCourseCode } from "@/constants/dropdownOptions";

const weekDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

const typeColorMap: Record<string, string> = {
  Lecture: "bg-lecture/10 text-lecture border-lecture/30",
  Lab: "bg-lab/10 text-lab border-lab/30",
  Tutorial: "bg-tutorial/10 text-tutorial border-tutorial/30",
  Workshop: "bg-workshop/10 text-workshop border-workshop/30",
  Online: "bg-online/10 text-online border-online/30",
  Practical: "bg-practical/10 text-practical border-practical/30",
};

function CohortCell({ cohortIds }: { cohortIds: string[] }) {
  if (!cohortIds || cohortIds.length === 0) {
    return <span className="text-muted-foreground">—</span>;
  }
  const labels = cohortIds.map(getCohortLabel);
  return (
    <div className="flex items-center gap-1">
      <span className="text-sm">{labels[0]}</span>
      {labels.length > 1 && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge variant="secondary" className="cursor-default">
              +{labels.length - 1}
            </Badge>
          </TooltipTrigger>
          <TooltipContent>{labels.join(", ")}</TooltipContent>
        </Tooltip>
      )}
    </div>
  );
}

export function ClassListTable() {
  const { classes, deleteClass } = useClasses();
  const { filters } = useFilters();
  const [attendanceDialogOpen, setAttendanceDialogOpen] = useState(false);
  const [selectedClass, setSelectedClass] = useState<any>(null);

  const handleMarkAttendance = (cls: ClassSchedule) => {
    const session = cls.sessions[0];
    setSelectedClass({
      subject: cls.subject,
      title: cls.title,
      date: new Date(cls.startDate).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      }),
      time: `${session.startTime} - ${session.endTime}`,
      room:
        session.deliveryMethod === "Online"
          ? "Online"
          : `${session.building} - ${session.room}`,
    });
    setAttendanceDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this class?")) {
      deleteClass(id);
    }
  };

  const filteredClasses = filterClasses(classes, filters);

  return (
    <div className="space-y-4">
      <div className="rounded-md border border-border bg-card">
        {filteredClasses.length === 0 ? (
          <FiltersEmptyState />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Subject</TableHead>
                <TableHead>Course</TableHead>
                <TableHead>Cohort/Intake</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Schedule</TableHead>
                <TableHead>Instructor</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Attendance</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredClasses.map((cls) => {
                const session = cls.sessions[0];
                const courseCode = getCourseCode(cls.courseId);
                return (
                  <TableRow key={cls.id}>
                    <TableCell className="font-medium">
                      {cls.subject} - {cls.title}
                    </TableCell>
                    <TableCell>
                      {courseCode ?? <span className="text-muted-foreground">—</span>}
                    </TableCell>
                    <TableCell>
                      <CohortCell cohortIds={cls.cohortIds} />
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={typeColorMap[session.deliveryType]}>
                        {session.deliveryType}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div className="font-medium">{weekDays[session.day]}</div>
                        <div className="text-muted-foreground">
                          {session.startTime} - {session.endTime}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{session.instructor}</TableCell>
                    <TableCell>
                      {session.deliveryMethod === "Online" ? (
                        <span className="text-online">Online</span>
                      ) : (
                        <div className="text-sm">
                          <div>{session.room}</div>
                          <div className="text-muted-foreground">{session.campus}</div>
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      {session.trackAttendance ? (
                        <div className="flex items-center gap-1 text-present">
                          <CheckCircle2 className="h-4 w-4" />
                          <span className="text-xs">{session.minAttendance}%</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <XCircle className="h-4 w-4" />
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleMarkAttendance(cls)}
                          title="Mark Attendance"
                        >
                          <ClipboardCheck className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" title="Edit Class">
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(cls.id)}
                          title="Delete Class"
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
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
