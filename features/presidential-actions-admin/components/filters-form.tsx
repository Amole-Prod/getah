import type { Route } from "next";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import {
  ACTION_IMPACT_OPTIONS,
  ACTION_SENTIMENT_OPTIONS,
} from "@/features/presidential-actions-admin/constants";
import type { PresidentialActionFilters } from "@/features/presidential-actions-admin/types";

type FiltersFormProps = {
  categories: string[];
  filters: PresidentialActionFilters;
};

export function FiltersForm({ categories, filters }: FiltersFormProps) {
  return (
    <form className="border-border/70 bg-surface/85 grid gap-3 rounded-3xl border p-4 md:grid-cols-5 xl:grid-cols-6">
      <Select name="category" defaultValue={filters.category}>
        <option value="">All categories</option>
        {categories.map((category) => (
          <option key={category} value={category}>
            {category}
          </option>
        ))}
      </Select>
      <Select name="sentiment" defaultValue={filters.sentiment}>
        <option value="">All sentiment</option>
        {ACTION_SENTIMENT_OPTIONS.map((item) => (
          <option key={item.value} value={item.value}>
            {item.label}
          </option>
        ))}
      </Select>
      <Select name="impactLevel" defaultValue={filters.impactLevel}>
        <option value="">All impact</option>
        {ACTION_IMPACT_OPTIONS.map((item) => (
          <option key={item.value} value={item.value}>
            {item.label}
          </option>
        ))}
      </Select>
      <Input name="dateFrom" type="date" defaultValue={filters.dateFrom} />
      <Input name="dateTo" type="date" defaultValue={filters.dateTo} />
      <div className="flex gap-2 xl:justify-end">
        <Button type="submit" className="flex-1 xl:flex-none">
          Apply
        </Button>
        <Button asChild variant="secondary" className="flex-1 xl:flex-none">
          <Link href={"/admin/presidential-actions" as Route}>Reset</Link>
        </Button>
      </div>
    </form>
  );
}
