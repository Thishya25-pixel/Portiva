// src/app/refund/page.tsx
export default function Refund() {
  return (
    <div className="max-w-2xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-4">Cancellation & Refund Policy</h1>
      <p>
        Due to the digital nature of software subscriptions on Portiva, all sales are final once digital access is granted.
      </p>
      <p className="mt-3">
        <strong>Exceptions:</strong> Refunds will only be issued if a technical error on our end prevents you from accessing your paid Pro account, or in the event of an accidental duplicate charge.
      </p>
      <p className="mt-3">
        To report a billing error or system malfunction, contact us at <strong>support@portiva.online</strong> within 7 days of the transaction.
      </p>
    </div>
  );
}