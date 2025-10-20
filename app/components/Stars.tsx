import { useMemo } from "react";
import { BsStarFill } from "react-icons/bs";

type StarsProps = {
  count?: number;
  className?: string;
};

export default function Stars({ count = 5, className }: StarsProps) {
  const keys = useMemo(() => {
    if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
      return Array.from({ length: count }, () => crypto.randomUUID());
    }
    return Array.from({ length: count }, (_, i) => `star-${i}`);
  }, [count]);
  return (
    <>
      {keys.map((k) => (
        <BsStarFill key={k} className={className} />
      ))}
    </>
  );
}
