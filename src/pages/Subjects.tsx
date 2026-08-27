import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Edit, Trash2, X } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { CAMPUSES, INSTRUCTORS, COHORTS } from "@/constants/dropdownOptions";

interface Subject {
  code: string;
  name: string;
  semester: string;
  campus: string;
  cohort: string;
  instructor: string;
  type: string;
  credits: number;
  students: number;
}

const SEMESTERS = ["Semester 1", "Semester 2"];
const TYPES = ["Lecture", "Lab", "Tutorial", "Workshop", "Online"];

const INITIAL_SUBJECTS: Subject[] = [
  { code: "BIO101", name: "Anatomy Basics", semester: "Semester 1", campus: "Sydney Campus", cohort: "Nursing 2025", instructor: "Dr. Nguyen", type: "Lecture", credits: 4, students: 45 },
  { code: "CHEM202", name: "Organic Chemistry", semester: "Semester 1", campus: "Sydney Campus", cohort: "Science 2024", instructor: "Prof. Smith", type: "Lab", credits: 3, students: 32 },
  { code: "MATH301", name: "Advanced Calculus", semester: "Semester 1", campus: "Melbourne Campus", cohort: "Engineering 2023", instructor: "Ms. Johnson", type: "Tutorial", credits: 4, students: 28 },
  { code: "PHYS202", name: "Quantum Physics", semester: "Semester 1", campus: "Sydney Campus", cohort: "Physics 2024", instructor: "Dr. Williams", type: "Lecture", credits: 4, students: 38 },
  { code: "CS401", name: "AI Workshop", semester: "Semester 1", campus: "Melbourne Campus", cohort: "Computer Science 2023", instructor: "Prof. Chen", type: "Workshop", credits: 3, students: 25 },
];

const emptyForm: Subject = {
  code: "",
  name: "",
  semester: "Semester 1",
  campus: CAMPUSES[0],
  cohort: COHORTS[0].label,
  instructor: INSTRUCTORS[0],
  type: "Lecture",
  credits: 3,
  students: 0,
};

export default function Subjects() {
  const [semester, setSemester] = useState("all");
  const [campus, setCampus] = useState("all");
  const [type, setType] = useState("all");
  const [subjects, setSubjects] = useState<Subject[]>(INITIAL_SUBJECTS);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCode, setEditingCode] = useState<string | null>(null);
  const [form, setForm] = useState<Subject>(emptyForm);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const typeColors: Record<string, string> = {
    Lecture: "bg-lecture/10 text-lecture",
    Lab: "bg-lab/10 text-lab",
    Tutorial: "bg-tutorial/10 text-tutorial",
    Workshop: "bg-workshop/10 text-workshop",
    Online: "bg-online/10 text-online",
  };

  const unique = (key: "semester" | "campus" | "type") =>
    Array.from(new Set(subjects.map((s) => s[key])));
  const semesterOptions = unique("semester");
  const campusOptions = unique("campus");
  const typeOptions = unique("type");

  const filteredSubjects = useMemo(
    () =>
      subjects.filter(
        (s) =>
          (semester === "all" || s.semester === semester) &&
          (campus === "all" || s.campus === campus) &&
          (type === "all" || s.type === type)
      ),
    [subjects, semester, campus, type]
  );

  const activeCount = [semester, campus, type].filter((v) => v !== "all").length;
  const clearFilters = () => {
    setSemester("all");
    setCampus("all");
    setType("all");
  };

  const openAdd = () => {
    setEditingCode(null);
    setForm(emptyForm);
    setErrors({});
    setDialogOpen(true);
  };

  const openEdit = (subject: Subject) => {
    setEditingCode(subject.code);
    setForm(subject);
    setErrors({});
    setDialogOpen(true);
  };

  const setField = <K extends keyof Subject>(key: K, value: Subject[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleSave = () => {
    const next: Record<string, string> = {};
    if (!form.code.trim()) next.code = "Subject code is required";
    else if (
      subjects.some(
        (s) => s.code.toLowerCase() === form.code.trim().toLowerCase() && s.code !== editingCode
      )
    )
      next.code = "A subject with this code already exists";
    if (!form.name.trim()) next.name = "Subject name is required";
    if (form.credits <= 0) next.credits = "Credits must be greater than 0";
    if (form.students < 0) next.students = "Students cannot be negative";
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    const saved: Subject = { ...form, code: form.code.trim().toUpperCase(), name: form.name.trim() };

    if (editingCode) {
      setSubjects((prev) => prev.map((s) => (s.code === editingCode ? saved : s)));
      toast({ title: "Subject updated", description: `${saved.code} — ${saved.name}` });
    } else {
      setSubjects((prev) => [...prev, saved]);
      toast({ title: "Subject added", description: `${saved.code} — ${saved.name}` });
    }
    setDialogOpen(false);
  };

  const handleDelete = (subject: Subject) => {
    setSubjects((prev) => prev.filter((s) => s.code !== subject.code));
    toast({ title: "Subject removed", description: `${subject.code} was deleted` });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-foreground">
            Subjects & Units
          </h2>
          <p className="text-muted-foreground">
            Manage subjects, allocations, and delivery modes
          </p>
        </div>
        <Button onClick={openAdd}>
          <Plus className="mr-2 h-4 w-4" />
          Add Subject
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="flex flex-wrap items-center gap-4 p-4">
          <Select value={semester} onValueChange={setSemester}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Semester" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Semesters</SelectItem>
              {semesterOptions.map((o) => (
                <SelectItem key={o} value={o}>{o}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={campus} onValueChange={setCampus}>
            <SelectTrigger className="w-[190px]">
              <SelectValue placeholder="Campus" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Campuses</SelectItem>
              {campusOptions.map((o) => (
                <SelectItem key={o} value={o}>{o}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={type} onValueChange={setType}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              {typeOptions.map((o) => (
                <SelectItem key={o} value={o}>{o}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {activeCount > 0 && (
            <Button variant="ghost" onClick={clearFilters} className="gap-1">
              <X className="h-4 w-4" />
              Clear filters ({activeCount})
            </Button>
          )}
          <span className="ml-auto text-sm text-muted-foreground">
            {filteredSubjects.length} of {subjects.length} subjects
          </span>
        </CardContent>
      </Card>

      {/* Subjects Table */}
      <Card>
        <CardHeader>
          <CardTitle>Subject List</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  {["Code", "Subject Name", "Type", "Instructor", "Campus", "Cohort", "Students", "Credits", "Actions"].map((h) => (
                    <th key={h} className="p-3 text-left text-sm font-medium text-muted-foreground">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredSubjects.map((subject) => (
                  <tr
                    key={subject.code}
                    className="border-b border-border hover:bg-muted/50"
                  >
                    <td className="p-3 text-sm font-medium text-foreground">
                      {subject.code}
                    </td>
                    <td className="p-3 text-sm text-foreground">
                      {subject.name}
                    </td>
                    <td className="p-3">
                      <span
                        className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                          typeColors[subject.type]
                        }`}
                      >
                        {subject.type}
                      </span>
                    </td>
                    <td className="p-3 text-sm text-muted-foreground">
                      {subject.instructor}
                    </td>
                    <td className="p-3 text-sm text-muted-foreground">
                      {subject.campus}
                    </td>
                    <td className="p-3 text-sm text-muted-foreground">
                      {subject.cohort}
                    </td>
                    <td className="p-3 text-sm text-muted-foreground">
                      {subject.students}
                    </td>
                    <td className="p-3 text-sm text-muted-foreground">
                      {subject.credits}
                    </td>
                    <td className="p-3">
                      <div className="flex gap-2">
                        <Button variant="ghost" size="icon" onClick={() => openEdit(subject)} aria-label={`Edit ${subject.code}`}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(subject)} aria-label={`Delete ${subject.code}`}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredSubjects.length === 0 && (
              <div className="flex flex-col items-center gap-3 py-16 text-center">
                <p className="text-muted-foreground">No subjects match the current filters</p>
                <Button variant="outline" onClick={clearFilters}>Clear filters</Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Add / Edit Subject dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingCode ? "Edit Subject" : "Add Subject"}</DialogTitle>
            <DialogDescription>
              Define the subject details, allocation and delivery mode.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="subject-code">Subject Code *</Label>
              <Input
                id="subject-code"
                value={form.code}
                onChange={(e) => setField("code", e.target.value)}
                placeholder="e.g. BIO102"
              />
              {errors.code && <p className="text-xs text-destructive">{errors.code}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="subject-name">Subject Name *</Label>
              <Input
                id="subject-name"
                value={form.name}
                onChange={(e) => setField("name", e.target.value)}
                placeholder="e.g. Human Physiology"
              />
              {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
            </div>

            <div className="space-y-2">
              <Label>Semester</Label>
              <Select value={form.semester} onValueChange={(v) => setField("semester", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {SEMESTERS.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Delivery Type</Label>
              <Select value={form.type} onValueChange={(v) => setField("type", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {TYPES.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Instructor</Label>
              <Select value={form.instructor} onValueChange={(v) => setField("instructor", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {INSTRUCTORS.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Campus</Label>
              <Select value={form.campus} onValueChange={(v) => setField("campus", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {CAMPUSES.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Cohort / Intake</Label>
              <Select value={form.cohort} onValueChange={(v) => setField("cohort", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Array.from(new Set([...COHORTS.map((c) => c.label), ...subjects.map((s) => s.cohort)])).map((o) => (
                    <SelectItem key={o} value={o}>{o}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="subject-credits">Credits</Label>
                <Input
                  id="subject-credits"
                  type="number"
                  min={1}
                  value={form.credits}
                  onChange={(e) => setField("credits", Number(e.target.value))}
                />
                {errors.credits && <p className="text-xs text-destructive">{errors.credits}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="subject-students">Students</Label>
                <Input
                  id="subject-students"
                  type="number"
                  min={0}
                  value={form.students}
                  onChange={(e) => setField("students", Number(e.target.value))}
                />
                {errors.students && <p className="text-xs text-destructive">{errors.students}</p>}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave}>{editingCode ? "Save Changes" : "Add Subject"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
