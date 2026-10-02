import SellForm from "./SellForm";

export const metadata = {
  title: "Sell an item | Reloved",
};

// Path 1. No account yet: she is only asked for an email and a phone number at
// submit, which is a later milestone. Nothing on this page needs sign-in.
export default function SellPage() {
  return (
    <main className="container" style={{ paddingTop: "var(--space-6)", paddingBottom: "var(--space-8)" }}>
      <div style={{ maxWidth: 480, margin: "0 auto" }}>
        <h1 className="text-h1" style={{ marginBottom: "var(--space-2)" }}>
          List an item
        </h1>
        <p className="text-body-sm" style={{ color: "var(--text-secondary)", marginBottom: "var(--space-6)" }}>
          Add a few photos and the details. We'll review it and get back to you within a day.
        </p>
        <SellForm />
      </div>
    </main>
  );
}
