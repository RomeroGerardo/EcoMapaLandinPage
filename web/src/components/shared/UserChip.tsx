import { User } from "lucide-react";

interface UserChipProps {
  email: string;
  role: string;
}

export function UserChip({ email, role }: UserChipProps) {
  return (
    <div className="flex items-center gap-2 rounded-full bg-white/15 px-3 py-1.5 border border-white/20">
      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-white/20">
        <User className="h-3.5 w-3.5 text-white" />
      </div>
      <div className="flex flex-col">
        <span className="text-[11px] font-medium leading-none text-white">
          {email.length > 24 ? `${email.substring(0, 22)}…` : email}
        </span>
        <span className="text-[9px] mt-0.5 leading-none text-white/70 capitalize">{role}</span>
      </div>
    </div>
  );
}
