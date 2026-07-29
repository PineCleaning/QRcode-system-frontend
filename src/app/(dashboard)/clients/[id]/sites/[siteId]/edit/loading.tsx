import { FormSkeleton } from '@/components/skeletons/FormSkeleton';
import { HeaderSkeleton } from '@/components/skeletons/HeaderSkeleton';

export default function Loading() {
  return (
    <div>
      <HeaderSkeleton titleWidth="w-24" withSubtitle={false} actionWidths={['w-32']} />
      <FormSkeleton fields={3} />
    </div>
  );
}
