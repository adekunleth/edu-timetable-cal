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

export default function Subjects() {
  const [semester, setSemester] = useState("all");
  const [campus, setCampus] = useState("all");
  const [type, setType] = useState("all");
  const subjects = [
    {
      code: "BIO101",
      name: "Anatomy Basics",
      semester: "Semester 1",
      campus: "Sydney Campus",
      cohort: "Nursing 2025",
      instructor: "Dr. Nguyen",
      type: "Lecture",
      credits: 4,
      students: 45,
    },
    {
      code: "CHEM202",
      name: "Organic Chemistry",
      semester: "Semester 1",
      campus: "Sydney Campus",
      cohort: "Science 2024",
      instructor: "Prof. Smith",
      type: "Lab",
      credits: 3,
      students: 32,
    },
    {
      code: "MATH301",
      name: "Advanced Calculus",
      semester: "Semester 1",
      campus: "Melbourne Campus",
      cohort: "Engineering 2023",
      instructor: "Ms. Johnson",
      type: "Tutorial",
      credits: 4,
      students: 28,
    },
    {
      code: "PHYS202",
      name: "Quantum Physics",
      semester: "Semester 1",
      campus: "Sydney Campus",
      cohort: "Physics 2024",
      instructor: "Dr. Williams",
      type: "Lecture",
      credits: 4,
      students: 38,
    },
    {
      code: "CS401",
      name: "AI Workshop",
      semester: "Semester 1",
      campus: "Melbourne Campus",
      cohort: "Computer Science 2023",
      instructor: "Prof. Chen",
      type: "Workshop",
      credits: 3,
      students: 25,
    },
  ];

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
        <Button>
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
                  <th className="p-3 text-left text-sm font-medium text-muted-foreground">
                    Code
                  </th>
                  <th className="p-3 text-left text-sm font-medium text-muted-foreground">
                    Subject Name
                  </th>
                  <th className="p-3 text-left text-sm font-medium text-muted-foreground">
                    Type
                  </th>
                  <th className="p-3 text-left text-sm font-medium text-muted-foreground">
                    Instructor
                  </th>
                  <th className="p-3 text-left text-sm font-medium text-muted-foreground">
                    Campus
                  </th>
                  <th className="p-3 text-left text-sm font-medium text-muted-foreground">
                    Cohort
                  </th>
                  <th className="p-3 text-left text-sm font-medium text-muted-foreground">
                    Students
                  </th>
                  <th className="p-3 text-left text-sm font-medium text-muted-foreground">
                    Credits
                  </th>
                  <th className="p-3 text-left text-sm font-medium text-muted-foreground">
                    Actions
                  </th>
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
                        <Button variant="ghost" size="icon">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon">
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
    </div>
  );
}
