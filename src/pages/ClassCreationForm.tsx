import { useState, useMemo } from "react";
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
import { useClasses } from "@/contexts/ClassesContext";
import { ClassSchedule, ClassSession, DeliveryType, DeliveryMethod } from "@/types/classForm";
import { ChevronLeft, Save, Upload, Plus, Trash2, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { SUBJECTS, INSTRUCTORS, CAMPUSES, BUILDINGS_ROOMS, STUDY_PERIODS, COHORTS } from "@/constants/dropdownOptions";
import { generateWeeksForPeriod, calculateNumberOfWeeks } from "@/utils/weekGenerator";

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
  const { classes, addClass } = useClasses();
  const { toast } = useToast();

  // Academic Context
  const [selectedSubject, setSelectedSubject] = useState("");
  const [studyPeriod, setStudyPeriod] = useState("");
  const [cohort, setCohort] = useState("");

  // Schedule
  const [startWeek, setStartWeek] = useState<number>();
  const [endWeek, setEndWeek] = useState<number>();
  const [contactHours, setContactHours] = useState<number>(2);

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

  // Generate weeks based on selected study period
  const availableWeeks = useMemo(() => {
    const period = STUDY_PERIODS.find(p => p.id === studyPeriod);
    if (!period) return [];
    return generateWeeksForPeriod(period.startDate, period.endDate);
  }, [studyPeriod]);

  // Calculate number of weeks and total contact hours
  const numberOfWeeks = useMemo(() => {
    if (startWeek && endWeek) {
      return calculateNumberOfWeeks(startWeek, endWeek);
    }
    return 0;
  }, [startWeek, endWeek]);

  const totalContactHours = useMemo(() => {
    return contactHours * numberOfWeeks;
  }, [contactHours, numberOfWeeks]);

  // Room conflict detection
  const detectRoomConflict = (sessionToCheck: ClassSession) => {
    return classes.some(cls => 
      cls.sessions.some(session => 
        session.day === sessionToCheck.day &&
        session.building === sessionToCheck.building &&
        session.room === sessionToCheck.room &&
        timeRangesOverlap(session.startTime, session.endTime, sessionToCheck.startTime, sessionToCheck.endTime)
      )
    );
  };

  const timeRangesOverlap = (start1: string, end1: string, start2: string, end2: string) => {
    return start1 < end2 && end1 > start2;
  };

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

  const handlePublish = () => {
    // Validation
    if (!selectedSubject) {
      toast({
        title: "Validation Error",
        description: "Please select a subject",
        variant: "destructive",
      });
      return;
    }

    if (!studyPeriod) {
      toast({
        title: "Validation Error",
        description: "Please select a study period",
        variant: "destructive",
      });
      return;
    }

    if (!startWeek || !endWeek) {
      toast({
        title: "Validation Error",
        description: "Please select start and end weeks",
        variant: "destructive",
      });
      return;
    }

    if (sessions.length === 0) {
      toast({
        title: "Validation Error",
        description: "Please add at least one class session",
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

    // Parse subject
    const subjectData = SUBJECTS.find(s => s.label === selectedSubject);
    if (!subjectData) {
      toast({
        title: "Validation Error",
        description: "Invalid subject selection",
        variant: "destructive",
      });
      return;
    }

    // Get selected period dates
    const period = STUDY_PERIODS.find(p => p.id === studyPeriod);
    if (!period) return;

    const startWeekData = availableWeeks.find(w => w.weekNumber === startWeek);
    const endWeekData = availableWeeks.find(w => w.weekNumber === endWeek);

    // Create class object
    const newClass: ClassSchedule = {
      id: `class-${Date.now()}`,
      subject: subjectData.code,
      title: subjectData.title,
      academicYear: period.id.split('-')[0],
      studyPeriod: period.label,
      cohort: cohort || undefined,
      startDate: startWeekData ? startWeekData.startDate.toISOString().split('T')[0] : '',
      endDate: endWeekData ? endWeekData.startDate.toISOString().split('T')[0] : '',
      sessions,
      description: description || undefined,
      internalNotes: internalNotes || undefined,
      color: typeColorMap[sessions[0]?.deliveryType || "Lecture"],
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
          <div className="space-y-2">
            <Label htmlFor="subject">
              Subject <span className="text-destructive">*</span>
            </Label>
            <Select value={selectedSubject} onValueChange={setSelectedSubject}>
              <SelectTrigger id="subject">
                <SelectValue placeholder="Select a subject" />
              </SelectTrigger>
              <SelectContent>
                {SUBJECTS.map((subject) => (
                  <SelectItem key={subject.code} value={subject.label}>
                    {subject.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="studyPeriod">
              Study Period / Semester <span className="text-destructive">*</span>
            </Label>
            <Select value={studyPeriod} onValueChange={(value) => {
              setStudyPeriod(value);
              setStartWeek(undefined);
              setEndWeek(undefined);
            }}>
              <SelectTrigger id="studyPeriod">
                <SelectValue placeholder="Select study period" />
              </SelectTrigger>
              <SelectContent>
                {STUDY_PERIODS.map((period) => (
                  <SelectItem key={period.id} value={period.id}>
                    {period.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="cohort">Cohort / Intake (Optional)</Label>
            <Select value={cohort} onValueChange={setCohort}>
              <SelectTrigger id="cohort">
                <SelectValue placeholder="Select cohort (optional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">None</SelectItem>
                {COHORTS.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
              <Label htmlFor="startWeek">
                Start Week <span className="text-destructive">*</span>
              </Label>
              <Select 
                value={startWeek?.toString()} 
                onValueChange={(value) => setStartWeek(parseInt(value))}
                disabled={!studyPeriod}
              >
                <SelectTrigger id="startWeek">
                  <SelectValue placeholder={studyPeriod ? "Select start week" : "Select study period first"} />
                </SelectTrigger>
                <SelectContent>
                  {availableWeeks.map((week) => (
                    <SelectItem key={week.weekNumber} value={week.weekNumber.toString()}>
                      {week.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="endWeek">
                End Week <span className="text-destructive">*</span>
              </Label>
              <Select 
                value={endWeek?.toString()} 
                onValueChange={(value) => setEndWeek(parseInt(value))}
                disabled={!startWeek}
              >
                <SelectTrigger id="endWeek">
                  <SelectValue placeholder={startWeek ? "Select end week" : "Select start week first"} />
                </SelectTrigger>
                <SelectContent>
                  {availableWeeks
                    .filter(week => startWeek ? week.weekNumber >= startWeek : true)
                    .map((week) => (
                      <SelectItem key={week.weekNumber} value={week.weekNumber.toString()}>
                        {week.label}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="weeks">Number of Weeks</Label>
              <Input 
                id="weeks"
                value={`${numberOfWeeks} weeks`} 
                readOnly 
                className="bg-muted" 
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="contactHours">Credit / Contact Hours (per week)</Label>
              <Input
                id="contactHours"
                type="number"
                min="1"
                step="0.5"
                value={contactHours}
                onChange={(e) => setContactHours(parseFloat(e.target.value) || 2)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="totalHours">Total Contact Hours</Label>
              <Input
                id="totalHours"
                type="text"
                value={`${totalContactHours} hours`}
                readOnly
                className="bg-muted"
              />
            </div>
          </div>

          <div className="rounded-lg bg-muted/50 p-3 text-sm">
            <span className="text-muted-foreground">Duration: </span>
            <span className="font-medium">{numberOfWeeks} weeks</span>
            <span className="mx-2 text-muted-foreground">•</span>
            <span className="text-muted-foreground">Total: </span>
            <span className="font-medium">{totalContactHours} contact hours</span>
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
                    <div className="space-y-2 md:col-span-3">
                      <Label>
                        Instructor <span className="text-destructive">*</span>
                      </Label>
                      <Select
                        value={session.instructor}
                        onValueChange={(value) =>
                          updateSession(session.id, { instructor: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select instructor" />
                        </SelectTrigger>
                        <SelectContent>
                          {INSTRUCTORS.map((instructor) => (
                            <SelectItem key={instructor} value={instructor}>
                              {instructor}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <h4 className="mb-3 text-sm font-semibold">Delivery Details</h4>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                      <div className="space-y-2">
                        <Label>Delivery Type</Label>
                        <Select
                          value={session.deliveryType}
                          onValueChange={(value: DeliveryType) =>
                            updateSession(session.id, { deliveryType: value })
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
                      <div className="space-y-2">
                        <Label>Delivery Method</Label>
                        <Select
                          value={session.deliveryMethod}
                          onValueChange={(value: DeliveryMethod) =>
                            updateSession(session.id, { deliveryMethod: value })
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

                  {session.deliveryMethod === "On-Campus" && (
                    <div className="border-t pt-4">
                      <h4 className="mb-3 text-sm font-semibold">Location Details</h4>
                      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label>Campus</Label>
                          <Select
                            value={session.campus || ""}
                            onValueChange={(value) =>
                              updateSession(session.id, { campus: value })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select campus" />
                            </SelectTrigger>
                            <SelectContent>
                              {CAMPUSES.map((campus) => (
                                <SelectItem key={campus} value={campus}>
                                  {campus}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>Building / Room</Label>
                          <Select
                            value={session.building && session.room ? `Building ${session.building} - Room ${session.room}` : ""}
                            onValueChange={(value) => {
                              const [building, room] = value.split(' - Room ');
                              updateSession(session.id, { 
                                building: building.replace('Building ', ''),
                                room: room 
                              });
                            }}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select building and room" />
                            </SelectTrigger>
                            <SelectContent>
                              {BUILDINGS_ROOMS.map((br) => (
                                <SelectItem key={br} value={br}>
                                  {br}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          {session.building && session.room && detectRoomConflict(session) && (
                            <div className="flex items-center gap-2 text-sm text-amber-600">
                              <AlertCircle className="h-4 w-4" />
                              <span>⚠️ Room conflict: This room is already booked for this time</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {(session.deliveryMethod === "Online" || session.deliveryMethod === "Blended") && (
                    <div className="border-t pt-4">
                      <h4 className="mb-3 text-sm font-semibold">Online Details</h4>
                      <div className="space-y-2">
                        <Label>Online Link</Label>
                        <Input
                          placeholder="e.g., https://zoom.us/j/123456789"
                          value={session.onlineLink || ""}
                          onChange={(e) =>
                            updateSession(session.id, { onlineLink: e.target.value })
                          }
                        />
                      </div>
                    </div>
                  )}

                  <div className="border-t pt-4">
                    <h4 className="mb-3 text-sm font-semibold">Attendance Tracking</h4>
                    <div className="space-y-4">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id={`attendance-${session.id}`}
                          checked={session.trackAttendance}
                          onCheckedChange={(checked) =>
                            updateSession(session.id, {
                              trackAttendance: checked as boolean,
                            })
                          }
                        />
                        <Label
                          htmlFor={`attendance-${session.id}`}
                          className="font-normal"
                        >
                          Enable attendance tracking for this session
                        </Label>
                      </div>

                      {session.trackAttendance && (
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                          <div className="space-y-2">
                            <Label>Minimum Attendance (%)</Label>
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
                              onValueChange={(value) =>
                                updateSession(session.id, {
                                  attendanceMethod: value as any,
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
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Section 3: Additional Information */}
      <Card>
        <CardHeader>
          <CardTitle>Additional Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Brief description of the class..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="internalNotes">Internal Notes (Optional)</Label>
            <Textarea
              id="internalNotes"
              placeholder="Add internal notes or reminders..."
              value={internalNotes}
              onChange={(e) => setInternalNotes(e.target.value)}
              rows={3}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
