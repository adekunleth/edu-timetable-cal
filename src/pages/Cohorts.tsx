import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Users, X } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function Cohorts() {
  const [program, setProgram] = useState("all");
  const [campus, setCampus] = useState("all");
  const [intake, setIntake] = useState("all");
  const cohorts = [
    {
      name: "Nursing 2025",
      program: "Bachelor of Nursing",
      students: 45,
      campus: "Sydney Campus",
      intake: "February 2025",
      subjects: ["BIO101", "CHEM101", "NURS101"],
    },
    {
      name: "Science 2024",
      program: "Bachelor of Science",
      students: 32,
      campus: "Sydney Campus",
      intake: "February 2024",
      subjects: ["CHEM202", "BIO201", "MATH201"],
    },
    {
      name: "Engineering 2023",
      program: "Bachelor of Engineering",
      students: 28,
      campus: "Melbourne Campus",
      intake: "February 2023",
      subjects: ["MATH301", "PHYS301", "ENG301"],
    },
    {
      name: "Physics 2024",
      program: "Bachelor of Physics",
      students: 38,
      campus: "Sydney Campus",
      intake: "July 2024",
      subjects: ["PHYS202", "MATH202", "CHEM201"],
    },
    {
      name: "Computer Science 2023",
      program: "Bachelor of Computer Science",
      students: 25,
      campus: "Melbourne Campus",
      intake: "February 2023",
      subjects: ["CS401", "MATH401", "ENG401"],
    },
  ];

  const unique = (key: "program" | "campus" | "intake") =>
    Array.from(new Set(cohorts.map((c) => c[key])));
  const programOptions = unique("program");
  const campusOptions = unique("campus");
  const intakeOptions = unique("intake");

  const filteredCohorts = useMemo(
    () =>
      cohorts.filter(
        (c) =>
          (program === "all" || c.program === program) &&
          (campus === "all" || c.campus === campus) &&
          (intake === "all" || c.intake === intake)
      ),
    [cohorts, program, campus, intake]
  );

  const activeCount = [program, campus, intake].filter((v) => v !== "all").length;
  const clearFilters = () => {
    setProgram("all");
    setCampus("all");
    setIntake("all");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-foreground">
            Cohorts & Groups
          </h2>
          <p className="text-muted-foreground">
            Manage student cohorts and intake groups
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Cohort
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="flex flex-wrap items-center gap-4 p-4">
          <Select value={program} onValueChange={setProgram}>
            <SelectTrigger className="w-[240px]">
              <SelectValue placeholder="Program" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Programs</SelectItem>
              {programOptions.map((o) => (
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
          <Select value={intake} onValueChange={setIntake}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Intake" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Intakes</SelectItem>
              {intakeOptions.map((o) => (
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
            {filteredCohorts.length} of {cohorts.length} cohorts
          </span>
        </CardContent>
      </Card>

      {/* Cohorts Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredCohorts.map((cohort, index) => (
          <Card key={index} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-lg">{cohort.name}</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {cohort.program}
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Students</p>
                  <p className="text-lg font-semibold text-foreground">
                    {cohort.students}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Subjects</p>
                  <p className="text-lg font-semibold text-foreground">
                    {cohort.subjects.length}
                  </p>
                </div>
              </div>

              <div>
                <p className="text-sm text-muted-foreground">Campus</p>
                <p className="text-sm font-medium text-foreground">
                  {cohort.campus}
                </p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground">Intake Period</p>
                <p className="text-sm font-medium text-foreground">
                  {cohort.intake}
                </p>
              </div>

              <div>
                <p className="mb-2 text-sm text-muted-foreground">
                  Enrolled Subjects
                </p>
                <div className="flex flex-wrap gap-2">
                  {cohort.subjects.map((subject) => (
                    <span
                      key={subject}
                      className="rounded-full bg-primary/10 px-2 py-1 text-xs font-medium text-primary"
                    >
                      {subject}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <Button variant="outline" size="sm" className="flex-1">
                  View Details
                </Button>
                <Button variant="outline" size="sm" className="flex-1">
                  Edit
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
