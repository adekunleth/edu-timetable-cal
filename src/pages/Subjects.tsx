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
import {
  CAMPUSES,
  INSTRUCTORS,
  COURSES,
  SUBJECTS,
  getSubjectsForCourse,
  getCohortsForCourse,
  getCohortLabel,
} from "@/constants/dropdownOptions";

interface SubjectOffering {
  id: string;
  courseId: string;
  code: string;
  name: string;
  semester: string;
  campus: string;
  cohortId: string;
  instructor: string;
  type: string;
  credits: number;
  students: number;
}

const SEMESTERS = ["Semester 1", "Semester 2"];
const TYPES = ["Lecture", "Lab", "Tutorial", "Workshop", "Online"];

const INITIAL_SUBJECTS: SubjectOffering[] = [
  { id: "o1", courseId: "BSC-BIO", code: "BIO101", name: "Anatomy Basics", semester: "Semester 1", campus: "Sydney Campus", cohortId: "2025-S1-BIO", instructor: "Dr. Sarah Nguyen", type: "Lecture", credits: 4, students: 45 },
  { id: "o2", courseId: "BSC-BIO", code: "CHEM202", name: "Organic Chemistry", semester: "Semester 1", campus: "Sydney Campus", cohortId: "2025-S2-BIO", instructor: "Dr. Maria Garcia", type: "Lab", credits: 3, students: 32 },
  { id: "o3", courseId: "BENG-MEC", code: "MATH301", name: "Advanced Calculus", semester: "Semester 1", campus: "Melbourne Campus", cohortId: "INTL-A", instructor: "Dr. Emily Johnson", type: "Tutorial", credits: 4, students: 28 },
  { id: "o4", courseId: "BSC-BIO", code: "PHYS202", name: "Quantum Physics", semester: "Semester 1", campus: "Sydney Campus", cohortId: "2025-S1-BIO", instructor: "Dr. James Wilson", type: "Lecture", credits: 4, students: 38 },
  { id: "o5", courseId: "BIT-CS", code: "CS101", name: "Introduction to Programming", semester: "Semester 1", campus: "Melbourne Campus", cohortId: "2024-S2-CS", instructor: "Prof. Michael Chen", type: "Workshop", credits: 3, students: 25 },
];

const blankForm = {
  id: "",
  courseId: "",
  code: "",
  semester: "Semester 1",
  campus: CAMPUSES[0],
  cohortId: "",
  instructor: INSTRUCTORS[0],
  type: "Lecture",
  credits: 3,
  students: 0,
};

type FormState = typeof blankForm;

export default function Subjects() {
  const [course, setCourse] = useState("all");
  const [semester, setSemester] = useState("all");
  const [campus, setCampus] = useState("all");
  const [type, setType] = useState("all");
  const [subjects, setSubjects] = useState<SubjectOffering[]>(INITIAL_SUBJECTS);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(blankForm);
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

  const filteredSubjects = useMemo(
    () =>
      subjects.filter(
        (s) =>
          (course === "all" || s.courseId === course) &&
          (semester === "all" || s.semester === semester) &&
          (campus === "all" || s.campus === campus) &&
          (type === "all" || s.type === type)
      ),
    [subjects, course, semester, campus, type]
  );

  const activeCount = [course, semester, campus, type].filter((v) => v !== "all").length;
  const clearFilters = () => {
    setCourse("all");
    setSemester("all");
    setCampus("all");
    setType("all");
  };

  const openAdd = () => {
    setEditingId(null);
    setForm(blankForm);
    setErrors({});
    setDialogOpen(true);
  };

  const openEdit = (offering: SubjectOffering) => {
    setEditingId(offering.id);
    setForm({ ...offering });
    setErrors({});
    setDialogOpen(true);
  };

  const setField = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  /** Changing programme clears subject + cohort selections that no longer belong to it. */
  const handleCourseChange = (courseId: string) => {
    setForm((prev) => {
      const subjectStillValid = getSubjectsForCourse(courseId).some((s) => s.code === prev.code);
      const cohortStillValid = getCohortsForCourse(courseId).some((c) => c.id === prev.cohortId);
      return {
        ...prev,
        courseId,
        code: subjectStillValid ? prev.code : "",
        cohortId: cohortStillValid ? prev.cohortId : "",
      };
    });
  };

  const availableSubjects = getSubjectsForCourse(form.courseId);
  const availableCohorts = getCohortsForCourse(form.courseId);

  const handleSave = () => {
    const next: Record<string, string> = {};
    if (!form.courseId) next.courseId = "Select a course / programme";
    if (!form.code) next.code = "Select a subject";
    if (!form.cohortId) next.cohortId = "Select a cohort / intake";
    if (form.credits <= 0) next.credits = "Credits must be greater than 0";
    if (form.students < 0) next.students = "Students cannot be negative";
    if (
      form.code &&
      subjects.some(
        (s) =>
          s.id !== editingId &&
          s.code === form.code &&
          s.cohortId === form.cohortId &&
          s.semester === form.semester
      )
    ) {
      next.code = "This subject is already allocated to that cohort and semester";
    }
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    const catalog = SUBJECTS.find((s) => s.code === form.code);
    const saved: SubjectOffering = {
      ...form,
      id: editingId ?? `o${Date.now()}`,
      name: catalog?.title ?? form.code,
    };

    if (editingId) {
      setSubjects((prev) => prev.map((s) => (s.id === editingId ? saved : s)));
      toast({ title: "Allocation updated", description: `${saved.code} — ${saved.name}` });
    } else {
      setSubjects((prev) => [...prev, saved]);
      toast({ title: "Subject allocated", description: `${saved.code} — ${saved.name}` });
    }
    setDialogOpen(false);
  };

  const handleDelete = (offering: SubjectOffering) => {
    setSubjects((prev) => prev.filter((s) => s.id !== offering.id));
    toast({ title: "Allocation removed", description: `${offering.code} was deleted` });
  };

  const courseCode = (id: string) => COURSES.find((c) => c.id === id)?.code ?? id;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-foreground">Subjects & Units</h2>
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
          <Select value={course} onValueChange={setCourse}>
            <SelectTrigger className="w-[240px]">
              <SelectValue placeholder="Course / Programme" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Courses</SelectItem>
              {COURSES.map((c) => (
                <SelectItem key={c.id} value={c.id}>{c.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={semester} onValueChange={setSemester}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Semester" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Semesters</SelectItem>
              {unique("semester").map((o) => (
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
              {unique("campus").map((o) => (
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
              {unique("type").map((o) => (
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
                  {["Code", "Subject Name", "Course", "Type", "Instructor", "Campus", "Cohort", "Students", "Credits", "Actions"].map((h) => (
                    <th key={h} className="p-3 text-left text-sm font-medium text-muted-foreground">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredSubjects.map((subject) => (
                  <tr key={subject.id} className="border-b border-border hover:bg-muted/50">
                    <td className="p-3 text-sm font-medium text-foreground">{subject.code}</td>
                    <td className="p-3 text-sm text-foreground">{subject.name}</td>
                    <td className="p-3 text-sm text-muted-foreground">{courseCode(subject.courseId)}</td>
                    <td className="p-3">
                      <span
                        className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                          typeColors[subject.type]
                        }`}
                      >
                        {subject.type}
                      </span>
                    </td>
                    <td className="p-3 text-sm text-muted-foreground">{subject.instructor}</td>
                    <td className="p-3 text-sm text-muted-foreground">{subject.campus}</td>
                    <td className="p-3 text-sm text-muted-foreground">{getCohortLabel(subject.cohortId)}</td>
                    <td className="p-3 text-sm text-muted-foreground">{subject.students}</td>
                    <td className="p-3 text-sm text-muted-foreground">{subject.credits}</td>
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

      {/* Add / Edit allocation dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit Subject Allocation" : "Add Subject"}</DialogTitle>
            <DialogDescription>
              Pick a subject from the course catalogue, then set the delivery details.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Course / Programme *</Label>
              <Select value={form.courseId} onValueChange={handleCourseChange}>
                <SelectTrigger><SelectValue placeholder="Select a course" /></SelectTrigger>
                <SelectContent>
                  {COURSES.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.courseId && <p className="text-xs text-destructive">{errors.courseId}</p>}
            </div>

            <div className="space-y-2">
              <Label>Subject *</Label>
              <Select
                value={form.code}
                onValueChange={(v) => setField("code", v)}
                disabled={!form.courseId}
              >
                <SelectTrigger>
                  <SelectValue placeholder={form.courseId ? "Select a subject" : "Select a course first"} />
                </SelectTrigger>
                <SelectContent>
                  {availableSubjects.map((s) => (
                    <SelectItem key={s.code} value={s.code}>{s.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.code && <p className="text-xs text-destructive">{errors.code}</p>}
            </div>

            <div className="space-y-2">
              <Label>Cohort / Intake *</Label>
              <Select
                value={form.cohortId}
                onValueChange={(v) => setField("cohortId", v)}
                disabled={!form.courseId}
              >
                <SelectTrigger>
                  <SelectValue placeholder={form.courseId ? "Select a cohort" : "Select a course first"} />
                </SelectTrigger>
                <SelectContent>
                  {availableCohorts.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.cohortId && <p className="text-xs text-destructive">{errors.cohortId}</p>}
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
              <Label>Campus</Label>
              <Select value={form.campus} onValueChange={(v) => setField("campus", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {CAMPUSES.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}
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
            <Button onClick={handleSave}>{editingId ? "Save Changes" : "Add Subject"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
