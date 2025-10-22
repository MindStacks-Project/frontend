import { formatTime } from "@/lib/utils";

export function Timer({ time }: { time: number }) {
  return (
    <span className="font-semibold font-code tabular-nums">
      {formatTime(time)}
    </span>
  );
}
