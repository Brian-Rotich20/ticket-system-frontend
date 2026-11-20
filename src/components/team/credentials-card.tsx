import { Button } from "@/components/ui/button";
import { CopyButton } from "@/components/ui/copy-button";
import type { TeamMember } from "@/lib/team";

type CredentialsCardProps = {
  member: TeamMember;
  password: string;
  onDismiss: () => void;
};

export function CredentialsCard({ member, password, onDismiss }: CredentialsCardProps) {
  return (
    <div role="status" className="space-y-3 rounded-2xl bg-emerald-50 p-5 ring-1 ring-emerald-200">
      <div>
        <p className="font-medium text-emerald-900">{member.name} can now sign in</p>
        <p className="mt-1 text-sm text-emerald-800">
          Share these details privately. The password is shown only now and cannot be recovered from this screen.
        </p>
      </div>

      <dl className="grid gap-2 text-sm sm:grid-cols-[auto_1fr] sm:gap-x-4">
        <dt className="text-emerald-800">Email</dt>
        <dd className="font-mono text-emerald-950">{member.email}</dd>
        <dt className="text-emerald-800">Password</dt>
        <dd className="font-mono text-emerald-950">{password}</dd>
      </dl>

      <div className="flex flex-wrap gap-2">
        <CopyButton value={`Email: ${member.email}\nPassword: ${password}`} label="Copy both" />
        <Button variant="ghost" onClick={onDismiss}>
          Done
        </Button>
      </div>
    </div>
  );
}