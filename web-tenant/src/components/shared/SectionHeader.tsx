import * as React from "react";

interface SectionHeaderProps {
  title: string;
  subtitle: string;
  icon: React.ElementType;
  iconBgColorClass?: string;
  iconColorClass?: string;
}

export function SectionHeader({
  title,
  subtitle,
  icon: Icon,
  iconBgColorClass = "bg-primary/10",
  iconColorClass = "text-primary",
}: SectionHeaderProps) {
  return (
    <div className="flex items-center gap-4">
      <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${iconBgColorClass}`}>
        <Icon className={`h-6 w-6 ${iconColorClass}`} />
      </div>
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-foreground">{title}</h2>
        <p className="text-sm text-muted-foreground">{subtitle}</p>
      </div>
    </div>
  );
}
