import SellFlow from "./SellFlow";

export const metadata = {
  title: "Sell an item | Reloved",
};

// Path 1. No account yet: she is only asked for an email and a phone number at
// submit, which is a later milestone. Nothing on this page needs sign-in.
export default function SellPage() {
  return (
    <main className="container sell-page">
      <SellFlow />
    </main>
  );
}
