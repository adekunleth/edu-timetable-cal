import { useState } from "react";
import { useClasses } from "@/contexts/ClassesContext";
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
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ClipboardCheck, Pencil, Trash2, Search, CheckCircle2, XCircle } from "lucide-react";
import { AttendanceMarkingDialog } from "./AttendanceMarkingDialog";
import { ClassSchedule } from "@/types/classForm";

const weekDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

const typeColorMap: Record<string, string> = {
  Lecture: "bg-lecture/10 text-lecture border-lecture/30",
  Lab: "bg-lab/10 text-lab border-lab/30",
  Tutorial: "bg-tutorial/10 text-tutorial border-tutorial/30",
  Workshop: "bg-workshop/10 text-workshop border-workshop/30",
  Online: "bg-online/10 text-online border-online/30",
  Practical: "bg-practical/10 text-practical border-practical/30",
};

export function ClassListTable() {
  const { classes, deleteClass } = useClasses();
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [dayFilter, setDayFilter] = useState<string>("all");
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
      room: session.deliveryMethod === "Online" 
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

  // Filter classes
  const filteredClasses = classes.filter((cls) => {
    const matchesSearch =
      cls.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cls.title.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesType =
      typeFilter === "all" ||
      cls.sessions.some((s) => s.deliveryType === typeFilter);
    
    const matchesDay =
      dayFilter === "all" ||
      cls.sessions.some((s) => s.day === parseInt(dayFilter));

    return matchesSearch && matchesType && matchesDay;
  });

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by subject or title..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="Lecture">Lecture</SelectItem>
            <SelectItem value="Lab">Lab</SelectItem>
            <SelectItem value="Tutorial">Tutorial</SelectItem>
            <SelectItem value="Workshop">Workshop</SelectItem>
            <SelectItem value="Online">Online</SelectItem>
            <SelectItem value="Practical">Practical</SelectItem>
          </SelectContent>
        </Select>
        <Select value={dayFilter} onValueChange={setDayFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Filter by day" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Days</SelectItem>
            {weekDays.map((day, index) => (
              <SelectItem key={day} value={index.toString()}>
                {day}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="rounded-md border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Subject</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Schedule</TableHead>
              <TableHead>Instructor</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Attendance</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredClasses.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="h-24 text-center">
                  <p className="text-muted-foreground">No classes found.</p>
                </TableCell>
              </TableRow>
            ) : (
              filteredClasses.map((cls) => {
                const session = cls.sessions[0]; // For now, show first session
                return (
                  <TableRow key={cls.id}>
                    <TableCell className="font-medium">{cls.subject}</TableCell>
                    <TableCell>{cls.title}</TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={typeColorMap[session.deliveryType]}
                      >
                        {session.deliveryType}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div className="font-medium">
                          {weekDays[session.day]}
                        </div>
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
                          <div className="text-muted-foreground">
                            {session.campus}
                          </div>
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
                        <Button
                          variant="ghost"
                          size="icon"
                          title="Edit Class"
                        >
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
              })
            )}
          </TableBody>
        </Table>
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
