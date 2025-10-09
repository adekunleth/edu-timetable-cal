import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useClasses } from "@/contexts/ClassesContext";
import { ClassSchedule, ClassSession, DeliveryType, DeliveryMethod } from "@/types/classForm";
import { ChevronLeft, Save, Upload, Plus, Trash2, CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

const typeColorMap: Record<DeliveryType, string> = {
  Lecture: "bg-lecture/10 border-lecture text-lecture",
  Lab: "bg-lab/10 border-lab text-lab",
  Tutorial: "bg-tutorial/10 border-tutorial text-tutorial",
  Workshop: "bg-workshop/10 border-workshop text-workshop",
  Online: "bg-online/10 border-online text-online",
  Practical: "bg-practical/10 border-practical text-practical",
};

export default function ClassCreationForm() {
  const navigate = useNavigate();
  const { addClass } = useClasses();
  const { toast } = useToast();

  // Academic Context
  const [academicYear, setAcademicYear] = useState("2025");
  const [studyPeriod, setStudyPeriod] = useState("Semester 1 (Feb–Jun)");
  const [term, setTerm] = useState("");
  const [subject, setSubject] = useState("");
  const [subjectTitle, setSubjectTitle] = useState("");
  const [course, setCourse] = useState("");
  const [cohort, setCohort] = useState("");

  // Schedule
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [customNotes, setCustomNotes] = useState("");

  // Sessions
  const [sessions, setSessions] = useState<ClassSession[]>([
    {
      id: "session-1",
      day: 0,
      startTime: "09:00",
      endTime: "11:00",
      instructor: "",
      deliveryType: "Lecture",
      deliveryMethod: "On-Campus",
      trackAttendance: true,
      minAttendance: 80,
      attendanceMethod: "Instructor Marked",
    },
  ]);

  // Additional Info
  const [description, setDescription] = useState("");
  const [internalNotes, setInternalNotes] = useState("");

  const addSession = () => {
    const newSession: ClassSession = {
      id: `session-${Date.now()}`,
      day: 0,
      startTime: "09:00",
      endTime: "11:00",
      instructor: "",
      deliveryType: "Lecture",
      deliveryMethod: "On-Campus",
      trackAttendance: true,
    };
    setSessions([...sessions, newSession]);
  };

  const removeSession = (id: string) => {
    if (sessions.length > 1) {
      setSessions(sessions.filter((s) => s.id !== id));
    }
  };

  const updateSession = (id: string, updates: Partial<ClassSession>) => {
    setSessions(
      sessions.map((s) => (s.id === id ? { ...s, ...updates } : s))
    );
  };

  const calculateWeeks = () => {
    if (!startDate || !endDate) return 0;
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.ceil(diffDays / 7);
  };

  const calculateContactHours = () => {
    return sessions.reduce((total, session) => {
      const start = parseFloat(session.startTime.split(":")[0]) + parseFloat(session.startTime.split(":")[1]) / 60;
      const end = parseFloat(session.endTime.split(":")[0]) + parseFloat(session.endTime.split(":")[1]) / 60;
      return total + (end - start);
    }, 0);
  };

  const handlePublish = () => {
    // Basic validation
    if (!subject || !subjectTitle || !startDate || !endDate) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    if (sessions.some((s) => !s.instructor)) {
      toast({
        title: "Validation Error",
        description: "All sessions must have an instructor assigned.",
        variant: "destructive",
      });
      return;
    }

    // Determine primary delivery type for color
    const primaryType = sessions[0]?.deliveryType || "Lecture";

    const newClass: ClassSchedule = {
      id: `class-${Date.now()}`,
      subject,
      title: subjectTitle,
      academicYear,
      studyPeriod,
      term: term || undefined,
      course: course || undefined,
      cohort: cohort || undefined,
      startDate: format(startDate, "yyyy-MM-dd"),
      endDate: format(endDate, "yyyy-MM-dd"),
      customNotes: customNotes || undefined,
      sessions,
      description: description || undefined,
      internalNotes: internalNotes || undefined,
      color: typeColorMap[primaryType],
    };

    addClass(newClass);
    toast({
      title: "Success",
      description: "Class created successfully!",
    });
    navigate("/calendar");
  };

  const weekDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/calendar")}
            className="mb-2 -ml-2"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back to Calendar
          </Button>
          <h2 className="text-3xl font-bold text-foreground">Create New Class</h2>
          <p className="text-muted-foreground">
            Dashboard → Calendar → Add Class
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate("/calendar")}>
            Cancel
          </Button>
          <Button variant="secondary">
            <Save className="mr-2 h-4 w-4" />
            Save as Draft
          </Button>
          <Button onClick={handlePublish}>
            <Upload className="mr-2 h-4 w-4" />
            Publish
          </Button>
        </div>
      </div>

      {/* Section 1: Academic Context */}
      <Card>
        <CardHeader>
          <CardTitle>Academic Context</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="academicYear">
                Academic Year <span className="text-destructive">*</span>
              </Label>
              <Select value={academicYear} onValueChange={setAcademicYear}>
                <SelectTrigger id="academicYear">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2024">2024</SelectItem>
                  <SelectItem value="2025">2025</SelectItem>
                  <SelectItem value="2026">2026</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="studyPeriod">
                Study Period / Semester <span className="text-destructive">*</span>
              </Label>
              <Select value={studyPeriod} onValueChange={setStudyPeriod}>
                <SelectTrigger id="studyPeriod">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Semester 1 (Feb–Jun)">
                    Semester 1 (Feb–Jun)
                  </SelectItem>
                  <SelectItem value="Semester 2 (Jul–Nov)">
                    Semester 2 (Jul–Nov)
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="term">Term / Block</Label>
              <Select value={term} onValueChange={setTerm}>
                <SelectTrigger id="term">
                  <SelectValue placeholder="Select term (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Term 1 (Weeks 1–7)">
                    Term 1 (Weeks 1–7)
                  </SelectItem>
                  <SelectItem value="Term 2 (Weeks 8–14)">
                    Term 2 (Weeks 8–14)
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="subject">
                Subject Code <span className="text-destructive">*</span>
              </Label>
              <Input
                id="subject"
                placeholder="e.g., BIO101"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="subjectTitle">
                Subject Title <span className="text-destructive">*</span>
              </Label>
              <Input
                id="subjectTitle"
                placeholder="e.g., Anatomy Basics"
                value={subjectTitle}
                onChange={(e) => setSubjectTitle(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="course">Course / Program</Label>
              <Select value={course} onValueChange={setCourse}>
                <SelectTrigger id="course">
                  <SelectValue placeholder="Select course (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Nursing">Bachelor of Nursing</SelectItem>
                  <SelectItem value="Medicine">Bachelor of Medicine</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {course && (
              <div className="space-y-2">
                <Label htmlFor="cohort">
                  Cohort / Intake <span className="text-destructive">*</span>
                </Label>
                <Select value={cohort} onValueChange={setCohort}>
                  <SelectTrigger id="cohort">
                    <SelectValue placeholder="Select cohort" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2025 S1">2025 S1</SelectItem>
                    <SelectItem value="2025 S2">2025 S2</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Section 2: Schedule & Recurrence */}
      <Card>
        <CardHeader>
          <CardTitle>Schedule & Recurrence</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label>
                Start Date <span className="text-destructive">*</span>
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !startDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {startDate ? format(startDate, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={setStartDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-2">
              <Label>
                End Date <span className="text-destructive">*</span>
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !endDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {endDate ? format(endDate, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={endDate}
                    onSelect={setEndDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-2">
              <Label>Number of Weeks</Label>
              <Input value={`${calculateWeeks()} weeks`} readOnly className="bg-muted" />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label>Credit / Contact Hours</Label>
              <Input
                value={`${calculateContactHours().toFixed(1)} hours/week`}
                readOnly
                className="bg-muted"
              />
            </div>
          </div>

          {/* Class Sessions */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Class Sessions</h3>
              <Button onClick={addSession} size="sm">
                <Plus className="mr-2 h-4 w-4" />
                Add Another Session
              </Button>
            </div>

            {sessions.map((session, index) => (
              <Card key={session.id} className="relative">
                <CardContent className="space-y-4 pt-6">
                  {sessions.length > 1 && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute right-2 top-2"
                      onClick={() => removeSession(session.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  )}

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-6">
                    <div className="space-y-2">
                      <Label>
                        Day <span className="text-destructive">*</span>
                      </Label>
                      <Select
                        value={session.day.toString()}
                        onValueChange={(v) =>
                          updateSession(session.id, { day: parseInt(v) })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {weekDays.map((day, i) => (
                            <SelectItem key={day} value={i.toString()}>
                              {day}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>
                        Start Time <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        type="time"
                        value={session.startTime}
                        onChange={(e) =>
                          updateSession(session.id, { startTime: e.target.value })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>
                        End Time <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        type="time"
                        value={session.endTime}
                        onChange={(e) =>
                          updateSession(session.id, { endTime: e.target.value })
                        }
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label>
                        Instructor <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        placeholder="e.g., Dr. Sarah Nguyen"
                        value={session.instructor}
                        onChange={(e) =>
                          updateSession(session.id, { instructor: e.target.value })
                        }
                      />
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <h4 className="mb-3 text-sm font-semibold">Delivery Details</h4>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                      <div className="space-y-2">
                        <Label>
                          Delivery Type <span className="text-destructive">*</span>
                        </Label>
                        <Select
                          value={session.deliveryType}
                          onValueChange={(v) =>
                            updateSession(session.id, { deliveryType: v as DeliveryType })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Lecture">Lecture</SelectItem>
                            <SelectItem value="Lab">Lab</SelectItem>
                            <SelectItem value="Tutorial">Tutorial</SelectItem>
                            <SelectItem value="Workshop">Workshop</SelectItem>
                            <SelectItem value="Online">Online</SelectItem>
                            <SelectItem value="Practical">Practical</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2 md:col-span-2">
                        <Label>
                          Delivery Method <span className="text-destructive">*</span>
                        </Label>
                        <Select
                          value={session.deliveryMethod}
                          onValueChange={(v) =>
                            updateSession(session.id, {
                              deliveryMethod: v as DeliveryMethod,
                            })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="On-Campus">On-Campus</SelectItem>
                            <SelectItem value="Online">Online</SelectItem>
                            <SelectItem value="Blended">Blended</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  {(session.deliveryMethod === "On-Campus" ||
                    session.deliveryMethod === "Blended") && (
                    <div className="border-t pt-4">
                      <h4 className="mb-3 text-sm font-semibold">Location</h4>
                      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                        <div className="space-y-2">
                          <Label>Campus</Label>
                          <Input
                            placeholder="e.g., Main Campus"
                            value={session.campus || ""}
                            onChange={(e) =>
                              updateSession(session.id, { campus: e.target.value })
                            }
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Building / Room</Label>
                          <Input
                            placeholder="e.g., Building A - Room 201"
                            value={session.room || ""}
                            onChange={(e) =>
                              updateSession(session.id, { room: e.target.value })
                            }
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Room Capacity</Label>
                          <Input
                            type="number"
                            placeholder="120"
                            value={session.roomCapacity || ""}
                            onChange={(e) =>
                              updateSession(session.id, {
                                roomCapacity: parseInt(e.target.value),
                              })
                            }
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {(session.deliveryMethod === "Online" ||
                    session.deliveryMethod === "Blended") && (
                    <div className="border-t pt-4">
                      <h4 className="mb-3 text-sm font-semibold">Online Details</h4>
                      <div className="space-y-2">
                        <Label>Online Link</Label>
                        <Input
                          placeholder="Zoom link or meeting URL"
                          value={session.onlineLink || ""}
                          onChange={(e) =>
                            updateSession(session.id, { onlineLink: e.target.value })
                          }
                        />
                      </div>
                    </div>
                  )}

                  <div className="border-t pt-4">
                    <h4 className="mb-3 text-sm font-semibold">Attendance Settings</h4>
                    <div className="space-y-4">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id={`track-${session.id}`}
                          checked={session.trackAttendance}
                          onCheckedChange={(checked) =>
                            updateSession(session.id, {
                              trackAttendance: !!checked,
                            })
                          }
                        />
                        <Label htmlFor={`track-${session.id}`}>
                          Track attendance
                        </Label>
                      </div>

                      {session.trackAttendance && (
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                          <div className="space-y-2">
                            <Label>Minimum Attendance %</Label>
                            <Input
                              type="number"
                              min="0"
                              max="100"
                              value={session.minAttendance || 80}
                              onChange={(e) =>
                                updateSession(session.id, {
                                  minAttendance: parseInt(e.target.value),
                                })
                              }
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Attendance Method</Label>
                            <Select
                              value={session.attendanceMethod || "Instructor Marked"}
                              onValueChange={(v) =>
                                updateSession(session.id, {
                                  attendanceMethod: v as any,
                                })
                              }
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Instructor Marked">
                                  Instructor Marked
                                </SelectItem>
                                <SelectItem value="Student Self-Check">
                                  Student Self-Check
                                </SelectItem>
                                <SelectItem value="QR Code Scan">
                                  QR Code Scan
                                </SelectItem>
                                <SelectItem value="Biometric">Biometric</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="flex items-end space-x-2">
                            <Checkbox
                              id={`reminder-${session.id}`}
                              checked={session.sendReminder}
                              onCheckedChange={(checked) =>
                                updateSession(session.id, {
                                  sendReminder: !!checked,
                                })
                              }
                            />
                            <Label htmlFor={`reminder-${session.id}`}>
                              Send reminder
                            </Label>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Custom Notes</Label>
              <Textarea
                placeholder="Any special instructions or notes about the schedule..."
                value={customNotes}
                onChange={(e) => setCustomNotes(e.target.value)}
                rows={3}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Section 3: Additional Information */}
      <Card>
        <CardHeader>
          <CardTitle>Additional Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Description / Summary</Label>
            <Textarea
              placeholder="Course description or summary..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>
          <div className="space-y-2">
            <Label>Internal Notes (Admins only)</Label>
            <Textarea
              placeholder="Internal administrative notes..."
              value={internalNotes}
              onChange={(e) => setInternalNotes(e.target.value)}
              rows={2}
              className="bg-late/5"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
