import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, X } from "lucide-react";
import {
  CAMPUSES,
  COURSES,
  INSTRUCTORS,
  SUBJECTS,
  getCohortsForCourse,
} from "@/constants/dropdownOptions";
import { ClassFilters, useFilters } from "@/contexts/FiltersContext";

const WEEK_DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
const DELIVERY_TYPES = ["Lecture", "Lab", "Tutorial", "Workshop", "Online", "Practical"];

interface ClassFilterBarProps {
  visible?: (keyof ClassFilters)[];
  className?: string;
}

const DEFAULT_VISIBLE: (keyof ClassFilters)[] = [
  "search",
  "courseId",
  "cohortId",
  "subject",
  "instructor",
  "campus",
  "deliveryType",
  "day",
];

export function ClassFilterBar({ visible = DEFAULT_VISIBLE, className }: ClassFilterBarProps) {
  const { filters, setFilter, resetFilters, activeFilterCount } = useFilters();
  const show = (key: keyof ClassFilters) => visible.includes(key);
  const cohortOptions = getCohortsForCourse(filters.courseId);

  return (
    <div className={`flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center ${className ?? ""}`}>
      {show("search") && (
        <div className="relative min-w-[200px] flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by subject or title..."
            value={filters.search}
            onChange={(e) => setFilter("search", e.target.value)}
            className="pl-9"
          />
        </div>
      )}

      {show("courseId") && (
        <Select value={filters.courseId} onValueChange={(v) => setFilter("courseId", v)}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="Course" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All courses</SelectItem>
            {COURSES.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      {show("cohortId") && (
        <Select value={filters.cohortId} onValueChange={(v) => setFilter("cohortId", v)}>
          <SelectTrigger className="w-full sm:w-[190px]">
            <SelectValue placeholder="Cohort" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All cohorts</SelectItem>
            <SelectItem value="unassigned">Unassigned</SelectItem>
            {cohortOptions.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      {show("subject") && (
        <Select value={filters.subject} onValueChange={(v) => setFilter("subject", v)}>
          <SelectTrigger className="w-full sm:w-[170px]">
            <SelectValue placeholder="Subject" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All subjects</SelectItem>
            {SUBJECTS.map((s) => (
              <SelectItem key={s.code} value={s.code}>
                {s.code}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      {show("instructor") && (
        <Select value={filters.instructor} onValueChange={(v) => setFilter("instructor", v)}>
          <SelectTrigger className="w-full sm:w-[190px]">
            <SelectValue placeholder="Instructor" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All instructors</SelectItem>
            {INSTRUCTORS.map((i) => (
              <SelectItem key={i} value={i}>
                {i}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      {show("campus") && (
        <Select value={filters.campus} onValueChange={(v) => setFilter("campus", v)}>
          <SelectTrigger className="w-full sm:w-[170px]">
            <SelectValue placeholder="Campus" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All campuses</SelectItem>
            {CAMPUSES.map((c) => (
              <SelectItem key={c} value={c}>
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      {show("deliveryType") && (
        <Select value={filters.deliveryType} onValueChange={(v) => setFilter("deliveryType", v)}>
          <SelectTrigger className="w-full sm:w-[150px]">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All types</SelectItem>
            {DELIVERY_TYPES.map((t) => (
              <SelectItem key={t} value={t}>
                {t}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      {show("day") && (
        <Select value={filters.day} onValueChange={(v) => setFilter("day", v)}>
          <SelectTrigger className="w-full sm:w-[150px]">
            <SelectValue placeholder="Day" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All days</SelectItem>
            {WEEK_DAYS.map((d, i) => (
              <SelectItem key={d} value={i.toString()}>
                {d}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      {activeFilterCount > 0 && (
        <Button variant="ghost" onClick={resetFilters} className="gap-1">
          <X className="h-4 w-4" />
          Clear filters ({activeFilterCount})
        </Button>
      )}
    </div>
  );
}

export function FiltersEmptyState() {
  const { resetFilters } = useFilters();
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
      <p className="text-muted-foreground">No classes match the current filters</p>
      <Button variant="outline" onClick={resetFilters}>
        Clear filters
      </Button>
    </div>
  );
}
