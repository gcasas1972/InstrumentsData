import { AdminRecords } from "@/app/components/AdminRecords";

export default function AdminPage() {
  return (
    <main className="page-shell">
      <section className="card admin-card">
        <AdminRecords />
      </section>
    </main>
  );
}
