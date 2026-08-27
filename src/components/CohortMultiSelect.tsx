import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ChevronsUpDown, X } from "lucide-react";
import { getCohortLabel, getCohortsForCourse } from "@/constants/dropdownOptions";

interface CohortMultiSelectProps {
  courseId?: string;
  value: string[];
  onChange: (value: string[]) => void;
}

export function CohortMultiSelect({ courseId, value, onChange }: CohortMultiSelectProps) {
  const options = getCohortsForCourse(courseId);

  const toggle = (id: string) =>
    onChange(value.includes(id) ? value.filter((v) => v !== id) : [...value, id]);

  return (
    <div className="space-y-2">
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" role="combobox" className="w-full justify-between font-normal">
            {value.length === 0
              ? "Select cohorts (optional)"
              : `${value.length} cohort${value.length > 1 ? "s" : ""} selected`}
            <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
          <Command>
            <CommandInput placeholder="Search cohorts..." />
            <CommandList>
              <CommandEmpty>No cohorts found.</CommandEmpty>
              <CommandGroup>
                {options.map((cohort) => (
                  <CommandItem
                    key={cohort.id}
                    value={cohort.label}
                    onSelect={() => toggle(cohort.id)}
                    className="gap-2"
                  >
                    <Checkbox checked={value.includes(cohort.id)} />
                    {cohort.label}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {value.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {value.map((id) => (
            <Badge key={id} variant="secondary" className="gap-1">
              {getCohortLabel(id)}
              <button
                type="button"
                onClick={() => onChange(value.filter((v) => v !== id))}
                aria-label={`Remove ${getCohortLabel(id)}`}
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
