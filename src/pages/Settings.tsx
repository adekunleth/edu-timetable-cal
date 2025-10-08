import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function Settings() {
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
              <select className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                <option>Semester System (2 periods)</option>
                <option>Trimester System (3 periods)</option>
                <option>Quarter System (4 periods)</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Semester 1 Start</Label>
                <Input type="date" />
              </div>
              <div className="space-y-2">
                <Label>Semester 1 End</Label>
                <Input type="date" />
              </div>
            </div>
            <Button className="w-full">Save Academic Calendar</Button>
          </CardContent>
        </Card>

        {/* Scheduling Rules */}
        <Card>
          <CardHeader>
            <CardTitle>Scheduling Framework</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Start Time</Label>
                <Input type="time" defaultValue="08:00" />
              </div>
              <div className="space-y-2">
                <Label>End Time</Label>
                <Input type="time" defaultValue="19:00" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Standard Class Duration</Label>
              <select className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                <option>1 hour</option>
                <option>1.5 hours</option>
                <option>2 hours</option>
                <option>3 hours</option>
              </select>
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
              <select className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                <option>Public Holiday</option>
                <option>Institutional Holiday</option>
                <option>Break Period</option>
              </select>
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
