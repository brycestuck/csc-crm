import Image from "next/image";
import { cn } from "@/lib/utils";

function getInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

type UserAvatarProps = {
  name: string;
  color: string;
  imagePath?: string | null;
  className?: string;
  textClassName?: string;
  sizes?: string;
};

export function UserAvatar({
  name,
  color,
  imagePath,
  className,
  textClassName,
  sizes = "80px",
}: UserAvatarProps) {
  return (
    <div
      className={cn(
        "relative flex items-center justify-center overflow-hidden rounded-lg border border-zinc-200 bg-zinc-100 text-white",
        className
      )}
      style={{ backgroundColor: color }}
    >
      {imagePath ? (
        <Image src={imagePath} alt={`${name} avatar`} fill sizes={sizes} className="object-cover" priority={false} />
      ) : (
        <span className={cn("font-mono font-semibold", textClassName)}>{getInitials(name)}</span>
      )}
    </div>
  );
}
