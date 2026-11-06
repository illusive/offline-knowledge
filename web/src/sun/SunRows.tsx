// One row of figures in the sun tool (D-056, D-058): a label, a value and a line under it, as a
// <div> inside a <dl>, so VoiceOver reads each row as label and value.

import type { ReactNode } from 'react';

export function Row({ label, value, detail }: { label: string; value?: ReactNode; detail?: string }) {
  return (
    <div className="grid grid-cols-[minmax(0,1fr)_auto] items-baseline gap-x-[12px] py-4">
      <dt className="font-semibold">{label}</dt>
      {value ? <dd className="text-2xl tabular-nums">{value}</dd> : null}
      {detail ? <dd className="col-span-2 text-sm text-muted">{detail}</dd> : null}
    </div>
  );
}
