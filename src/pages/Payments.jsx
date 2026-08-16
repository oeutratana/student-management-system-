import ResourcePage from "../components/ResourcePage"
import { paymentsApi, feesApi, toOptions } from "../services/schoolApi"

const feeLabel = (item) => {
  const student = item.student?.first_name ? `${item.student.first_name} ${item.student.last_name}` : ""
  return [student, item.fee_type].filter(Boolean).join(" - ")
}

export default function Payments() {
  return (
    <ResourcePage
      api={paymentsApi}
      columns={[
        { key: "id", label: "ID" },
        { key: "fee", label: "Fee", render: (item) => feeLabel(item.fee) },
        { key: "amount", label: "Amount" },
        { key: "payment_date", label: "Payment Date" },
        { key: "method", label: "Method" },
        { key: "status", label: "Status", render: (item) => (
          <span className={`badge ${item.status === "Completed" ? "badge--green" : item.status === "Pending" ? "badge--orange" : "badge--gray"}`}>{item.status}</span>
        ) },
      ]}
      description="Record payments made against student fees."
      fields={[
        { name: "fee_id", label: "Fee", type: "select", required: true, loadOptions: () => feesApi.list().then((rows) => toOptions(rows, feeLabel)) },
        { name: "amount", label: "Amount", type: "number", required: true },
        { name: "payment_date", label: "Payment Date", type: "date", required: true },
        { name: "method", label: "Method", type: "select", required: true, options: [
          { value: "Cash", label: "Cash" },
          { value: "Bank Transfer", label: "Bank Transfer" },
          { value: "Card", label: "Card" },
        ] },
        { name: "status", label: "Status", type: "select", options: [
          { value: "Pending", label: "Pending" },
          { value: "Completed", label: "Completed" },
          { value: "Failed", label: "Failed" },
        ] },
      ]}
      searchKeys={["fee.student.first_name", "fee.student.last_name", "method", "status"]}
      title="Payments"
    />
  )
}
