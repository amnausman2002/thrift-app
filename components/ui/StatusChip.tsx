import { LISTING_STATUS_LABELS } from "@/lib/constants";
import type { ListingStatus } from "@/lib/constants";

// .status-chip from components.html, one variant per listing status. Small
// labels only, never a large fill: `sold` is the only solid one.
//
// Note for the seller view: components.html shows sellers a neutral "Needs
// attention" in amber instead of the red Rejected chip. That variant is not
// built yet and belongs with the my-listings screen.
export default function StatusChip({ status }: { status: ListingStatus }) {
  return (
    <span className={`status-chip status-${status}`}>
      {LISTING_STATUS_LABELS[status]}
    </span>
  );
}
