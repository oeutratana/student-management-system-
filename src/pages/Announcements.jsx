import ResourcePage from "../components/ResourcePage"
import { announcementsApi } from "../services/schoolApi"

export default function Announcements() {
  return (
    <ResourcePage
      api={announcementsApi}
      columns={[
        { key: "id", label: "ID" },
        { key: "title", label: "Title" },
        { key: "audience", label: "Audience" },
        { key: "publish_date", label: "Publish Date" },
        { key: "status", label: "Status", render: (item) => (
          <span className={`badge ${item.status === "Published" ? "badge--green" : item.status === "Draft" ? "badge--gray" : "badge--blue"}`}>{item.status}</span>
        ) },
      ]}
      description="Publish announcements to students, parents or teachers."
      fields={[
        { name: "title", label: "Title", required: true },
        { name: "content", label: "Content", type: "textarea", required: true },
        { name: "audience", label: "Audience", type: "select", options: [
          { value: "All", label: "All" },
          { value: "Students", label: "Students" },
          { value: "Parents", label: "Parents" },
          { value: "Teachers", label: "Teachers" },
        ] },
        { name: "publish_date", label: "Publish Date", type: "date" },
        { name: "status", label: "Status", type: "select", options: [
          { value: "Draft", label: "Draft" },
          { value: "Published", label: "Published" },
        ] },
      ]}
      searchKeys={["title", "content", "audience"]}
      title="Announcements"
    />
  )
}
