import { Input } from "@/components/ui/input";
import { SubmitButton } from "@/components/forms/submit-button";

type SourcesSearchFormProps = {
  query: string;
};

export function SourcesSearchForm({ query }: SourcesSearchFormProps) {
  return (
    <form className="flex flex-col gap-3 sm:flex-row">
      <Input
        name="query"
        defaultValue={query}
        placeholder="Search source name or URL"
        className="sm:max-w-sm"
      />
      <input type="hidden" name="page" value="1" />
      <SubmitButton variant="secondary" pendingLabel="Searching...">
        Search
      </SubmitButton>
    </form>
  );
}
