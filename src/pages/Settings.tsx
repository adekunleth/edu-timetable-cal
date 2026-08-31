import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAttendanceSettings } from "@/contexts/AttendanceSettingsContext";

const PERIOD_SYSTEMS = {
  semester: { label: "Semester System (2 periods)", periods: ["Semester 1", "Semester 2"] },
  trimester: { label: "Trimester System (3 periods)", periods: ["Trimester 1", "Trimester 2", "Trimester 3"] },
  quarter: { label: "Quarter System (4 periods)", periods: ["Quarter 1", "Quarter 2", "Quarter 3", "Quarter 4"] },
} as const;

type PeriodSystem = keyof typeof PERIOD_SYSTEMS;

const DURATIONS = {
  "1": "1 hour",
  "1.5": "1.5 hours",
  "2": "2 hours",
  "3": "3 hours",
} as const;

export default function Settings() {
  const [schedulingDays, setSchedulingDays] = useState({
    monday: true,
    tuesday: true,
    wednesday: true,
    thursday: true,
    friday: true,
    saturday: false,
    sunday: false,
  });

  const [periodSystem, setPeriodSystem] = useState<PeriodSystem>("semester");
  const [classDuration, setClassDuration] = useState<keyof typeof DURATIONS>("1");
  const [holidayType, setHolidayType] = useState("Public Holiday");
  const [dayStart, setDayStart] = useState("08:00");
  const [dayEnd, setDayEnd] = useState("19:00");
  const { windowHours, setWindowHours } = useAttendanceSettings();

  const activeDays = Object.entries(schedulingDays).filter(([, v]) => v).length;
  const toHours = (t: string) => {
    const [h, m] = t.split(":").map(Number);
    return h + m / 60;
  };
  const slotsPerDay = Math.max(
    0,
    Math.floor((toHours(dayEnd) - toHours(dayStart)) / parseFloat(classDuration))
  );

  const toggleDay = (day: keyof typeof schedulingDays) => {
    setSchedulingDays(prev => ({ ...prev, [day]: !prev[day] }));
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-foreground">Settings</h2>
        <p className="text-muted-foreground">
          Configure academic calendar and system preferences
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Academic Calendar */}
        <Card>
          <CardHeader>
            <CardTitle>Academic Calendar Setup</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Academic Year</Label>
              <Input placeholder="2025" />
            </div>
            <div className="space-y-2">
              <Label>Study Periods</Label>
              <Select value={periodSystem} onValueChange={(v) => setPeriodSystem(v as PeriodSystem)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(PERIOD_SYSTEMS) as PeriodSystem[]).map((k) => (
                    <SelectItem key={k} value={k}>
                      {PERIOD_SYSTEMS[k].label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {PERIOD_SYSTEMS[periodSystem].periods.map((name) => (
              <div key={name} className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{name} Start</Label>
                  <Input type="date" />
                </div>
                <div className="space-y-2">
                  <Label>{name} End</Label>
                  <Input type="date" />
                </div>
              </div>
            ))}
            <Button className="w-full">Save Academic Calendar</Button>
          </CardContent>
        </Card>

        {/* Scheduling Rules */}
        <Card>
          <CardHeader>
            <CardTitle>Scheduling Framework</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Available Days</Label>
              <div className="flex flex-wrap gap-4 p-4 bg-muted/30 rounded-lg">
                {[
                  { key: 'monday', label: 'Monday' },
                  { key: 'tuesday', label: 'Tuesday' },
                  { key: 'wednesday', label: 'Wednesday' },
                  { key: 'thursday', label: 'Thursday' },
                  { key: 'friday', label: 'Friday' },
                  { key: 'saturday', label: 'Saturday' },
                  { key: 'sunday', label: 'Sunday' },
                ].map(({ key, label }) => (
                  <div key={key} className="flex items-center gap-2">
                    <Checkbox
                      id={key}
                      checked={schedulingDays[key as keyof typeof schedulingDays]}
                      onCheckedChange={() => toggleDay(key as keyof typeof schedulingDays)}
                    />
                    <Label htmlFor={key} className="cursor-pointer font-normal">
                      {label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Start Time</Label>
                <Input type="time" value={dayStart} onChange={(e) => setDayStart(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>End Time</Label>
                <Input type="time" value={dayEnd} onChange={(e) => setDayEnd(e.target.value)} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Standard Class Duration</Label>
              <Select value={classDuration} onValueChange={(v) => setClassDuration(v as keyof typeof DURATIONS)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(DURATIONS) as (keyof typeof DURATIONS)[]).map((k) => (
                    <SelectItem key={k} value={k}>
                      {DURATIONS[k]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                {slotsPerDay} slots/day × {activeDays} day{activeDays === 1 ? "" : "s"} ={" "}
                {slotsPerDay * activeDays} teachable slots per week
              </p>
            </div>
            <div className="space-y-2">
              <Label>Break Duration (minutes)</Label>
              <Input type="number" placeholder="15" />
            </div>
            <Button className="w-full">Save Scheduling Rules</Button>
          </CardContent>
        </Card>

        {/* Holidays */}
        <Card>
          <CardHeader>
            <CardTitle>Holiday Management</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Holiday Name</Label>
              <Input placeholder="e.g., Mid-Semester Break" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Start Date</Label>
                <Input type="date" />
              </div>
              <div className="space-y-2">
                <Label>End Date</Label>
                <Input type="date" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Holiday Type</Label>
              <Select value={holidayType} onValueChange={setHolidayType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {["Public Holiday", "Institutional Holiday", "Break Period"].map((t) => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                {holidayType === "Break Period"
                  ? "Break periods exclude every class in the range from attendance."
                  : "Classes on this date are cancelled and excluded from contact hours."}
              </p>
            </div>
            <Button className="w-full">Add Holiday</Button>
          </CardContent>
        </Card>

        {/* Attendance Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Attendance Configuration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Minimum Attendance Threshold (%)</Label>
              <Input type="number" placeholder="80" />
            </div>
            <div className="space-y-2">
              <Label>Late Arrival Grace Period (minutes)</Label>
              <Input type="number" placeholder="10" />
            </div>
            <div className="space-y-2">
              <Label>Attendance Marking Window (hours after class ends)</Label>
              <Input
                type="number"
                min={1}
                value={windowHours}
                onChange={(e) => setWindowHours(Number(e.target.value))}
              />
              <p className="text-xs text-muted-foreground">
                Marking opens when a class starts and closes {windowHours} hour
                {windowHours === 1 ? "" : "s"} after it ends. After that, the
                session is locked.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="auto-alerts" className="rounded" />
              <Label htmlFor="auto-alerts">
                Send automatic alerts for low attendance
              </Label>
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="visa-tracking" className="rounded" />
              <Label htmlFor="visa-tracking">
                Enable CRICOS compliance tracking
              </Label>
            </div>
            <Button className="w-full">Save Attendance Settings</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
