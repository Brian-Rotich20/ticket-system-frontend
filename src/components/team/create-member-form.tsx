"use client";

import { useState, type FormEvent } from "react";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Field } from "@/components/ui/field";
import { SelectField } from "@/components/ui/select-field";
import { errorMessage } from "@/lib/api";
import { createMember, generatePassword, type NewMemberInput, type TeamMember } from "@/lib/team";

type CreateMemberFormProps = {
  onCreated: (member: TeamMember, password: string) => void;
  onCancel: () => void;
};

export function CreateMemberForm({ onCreated, onCancel }: CreateMemberFormProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<NewMemberInput["role"]>("AGENT");
  const [password, setPassword] = useState(() => generatePassword());
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const member = await createMember({ name: name.trim(), email: email.trim().toLowerCase(), password, role });
      onCreated(member, password);
    } catch (err) {
      setError(errorMessage(err));
      setBusy(false);
    }
  }

  return (
    <Card>
      <h2 className="text-base font-semibold">Add a team member</h2>
      <form onSubmit={onSubmit} className="mt-4 space-y-4">
        {error ? <Alert>{error}</Alert> : null}

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Full name" name="name" required value={name} onChange={(e) => setName(e.target.value)} />
          <Field label="Email" name="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <SelectField
            label="Role"
            name="role"
            value={role}
            onChange={(e) => setRole(e.target.value as NewMemberInput["role"])}
            hint={role === "ADMIN" ? "Admins manage the team and can see the audit log." : "Agents work on tickets."}
          >
            <option value="AGENT">Agent</option>
            <option value="ADMIN">Admin</option>
          </SelectField>

          <div>
            <Field
              label="Temporary password"
              name="password"
              required
              minLength={8}
              className="font-mono"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              hint="At least 8 characters. You will see it once after saving."
            />
            <button
              type="button"
              onClick={() => setPassword(generatePassword())}
              className="mt-1 text-xs font-medium text-indigo-600 hover:text-indigo-500"
            >
              Generate a new one
            </button>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Button variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" loading={busy}>
            Create account
          </Button>
        </div>
      </form>
    </Card>
  );
}