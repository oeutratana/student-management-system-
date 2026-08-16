import ResourcePage from "../components/ResourcePage"
import { feesApi, studentsApi, toOptions } from "../services/schoolApi"

export default function Fees() {
  return (
    <ResourcePage
      api={feesApi}
      columns={[
        { key: "id", label: "ID" },
        { key: "student", label: "Student", render: (item) => item.student?.first_name ? `${item.student.first_name} ${item.student.last_name}` : "-" },
        { key: "fee_type", label: "Fee Type" },
        { key: "amount", label: "Amount" },
        { key: "due_date", label: "Due Date" },
        { key: "status", label: "Status", render: (item) => (
          <span className={`badge ${item.status === "Paid" ? "badge--green" : item.status === "Pending" ? "badge--orange" : "badge--gray"}`}>{item.status}</span>
        ) },
      ]}
      description="Track tuition and fee charges assigned to each student."
      fields={[
        { name: "student_id", label: "Student", type: "select", required: true, loadOptions: () => studentsApi.list().then((rows) => toOptions(rows, (item) => `${item.first_name} ${item.last_name}`)) },
        { name: "fee_type", label: "Fee Type", required: true },
        { name: "amount", label: "Amount", type: "number", required: true },
        { name: "due_date", label: "Due Date", type: "date" },
        { name: "status", label: "Status", type: "select", options: [
          { value: "Pending", label: "Pending" },
          { value: "Paid", label: "Paid" },
          { value: "Overdue", label: "Overdue" },
        ] },
      ]}
      searchKeys={["student.first_name", "student.last_name", "fee_type"]}
      title="Fees"
    />
  )
}
