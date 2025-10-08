import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle, Clock, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Student {
  id: string;
  name: string;
  studentId: string;
}

interface ClassInfo {
  subject: string;
  title: string;
  date: string;
  time: string;
  room: string;
}

interface AttendanceMarkingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  classInfo: ClassInfo;
}

type AttendanceStatus = "present" | "absent" | "late" | "excused" | null;

export function AttendanceMarkingDialog({
  open,
  onOpenChange,
  classInfo,
}: AttendanceMarkingDialogProps) {
  const { toast } = useToast();
  
  // Sample student data - in real app, this would come from API
  const students: Student[] = [
    { id: "1", name: "Alice Johnson", studentId: "S2024001" },
    { id: "2", name: "Bob Smith", studentId: "S2024002" },
    { id: "3", name: "Carol Williams", studentId: "S2024003" },
    { id: "4", name: "David Brown", studentId: "S2024004" },
    { id: "5", name: "Emma Davis", studentId: "S2024005" },
    { id: "6", name: "Frank Miller", studentId: "S2024006" },
  ];

  const [attendance, setAttendance] = useState<Record<string, AttendanceStatus>>(
    {}
  );

  const handleStatusChange = (studentId: string, status: AttendanceStatus) => {
    setAttendance((prev) => ({
      ...prev,
      [studentId]: prev[studentId] === status ? null : status,
    }));
  };

  const handleMarkAllPresent = () => {
    const allPresent: Record<string, AttendanceStatus> = {};
    students.forEach((student) => {
      allPresent[student.id] = "present";
    });
    setAttendance(allPresent);
  };

  const handleSave = () => {
    // Check if all students have a status
    const unmarkedStudents = students.filter((s) => !attendance[s.id]);
    
    if (unmarkedStudents.length > 0) {
      toast({
        title: "Incomplete Attendance",
        description: `Please mark attendance for all ${unmarkedStudents.length} remaining student(s).`,
        variant: "destructive",
      });
      return;
    }

    // In real app, save to backend here
    toast({
      title: "Attendance Saved",
      description: `Attendance for ${classInfo.subject} has been recorded successfully.`,
    });
    
    onOpenChange(false);
    setAttendance({});
  };

  const getStatusButton = (
    studentId: string,
    status: AttendanceStatus,
    label: string,
    icon: React.ReactNode,
    colorClass: string
  ) => {
    const isSelected = attendance[studentId] === status;
    return (
      <Button
        variant={isSelected ? "default" : "outline"}
        size="sm"
        className={isSelected ? colorClass : ""}
        onClick={() => handleStatusChange(studentId, status)}
      >
        {icon}
        <span className="ml-1">{label}</span>
      </Button>
    );
  };

  const unmarkedCount = students.filter((s) => !attendance[s.id]).length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Mark Attendance</DialogTitle>
          <DialogDescription>
            <div className="mt-2 space-y-1 text-sm">
              <div><strong>Subject:</strong> {classInfo.subject} - {classInfo.title}</div>
              <div><strong>Date & Time:</strong> {classInfo.date} at {classInfo.time}</div>
              <div><strong>Room:</strong> {classInfo.room}</div>
            </div>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {unmarkedCount > 0 ? (
                <span className="text-destructive font-medium">
                  {unmarkedCount} student(s) remaining
                </span>
              ) : (
                <span className="text-present font-medium">
                  All students marked ✓
                </span>
              )}
            </p>
            <Button variant="outline" size="sm" onClick={handleMarkAllPresent}>
              Mark All Present
            </Button>
          </div>

          <div className="space-y-2">
            {students.map((student) => (
              <div
                key={student.id}
                className="flex items-center justify-between gap-4 rounded-lg border p-4"
              >
                <div className="flex-1">
                  <p className="font-medium">{student.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {student.studentId}
                  </p>
                </div>
                <div className="flex gap-2">
                  {getStatusButton(
                    student.id,
                    "present",
                    "Present",
                    <CheckCircle2 className="h-4 w-4" />,
                    "bg-present hover:bg-present/90"
                  )}
                  {getStatusButton(
                    student.id,
                    "absent",
                    "Absent",
                    <XCircle className="h-4 w-4" />,
                    "bg-absent hover:bg-absent/90"
                  )}
                  {getStatusButton(
                    student.id,
                    "late",
                    "Late",
                    <Clock className="h-4 w-4" />,
                    "bg-late hover:bg-late/90"
                  )}
                  {getStatusButton(
                    student.id,
                    "excused",
                    "Excused",
                    <AlertCircle className="h-4 w-4" />,
                    "bg-excused hover:bg-excused/90"
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save Attendance</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
