import { useCallback, useEffect, useMemo, useState } from "react"
import {
  Database,
  Inbox,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  X,
} from "lucide-react"
import { useAuth } from "../context/AuthContext"
import { useLanguage } from "../context/LanguageContext"

const emptyValue = (field) => field.defaultValue ?? ""

const getNestedValue = (item, path) =>
  path.split(".").reduce((value, key) => value?.[key], item)

const normalize = (value) => String(value ?? "").toLowerCase()

const buildInitialForm = (fields) =>
  fields.reduce((form, field) => ({ ...form, [field.name]: emptyValue(field) }), {})

const formatValue = (item, column) => {
  const value = column.render ? column.render(item) : getNestedValue(item, column.key)
  return value === undefined || value === null || value === "" ? "-" : value
}

const FieldControl = ({ field, form, onChange }) => {
  const { t } = useLanguage()
  const shared = {
    name: field.name,
    value: form[field.name],
    onChange,
  }

  if (field.type === "select") {
    return (
      <select {...shared} required={field.required}>
        <option value="">{t("res.select", { label: field.label })}</option>
        {(field.options || []).map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    )
  }

  if (field.type === "textarea") {
    return <textarea {...shared} rows={3} />
  }

  return (
    <input
      {...shared}
      required={field.required}
      type={field.type || "text"}
      placeholder={t("res.enter", { label: field.label })}
    />
  )
}

export default function ResourcePage({ title, description, api, fields, columns, searchKeys = [], managePermission, createPermission, singular }) {
  const { user } = useAuth()
  const { t } = useLanguage()
  const canManage =
    !managePermission ||
    user?.role === "admin" ||
    (user?.permissions ?? []).includes(managePermission)
  const canCreate =
    !createPermission
      ? canManage
      : user?.role === "admin" || (user?.permissions ?? []).includes(createPermission)

  const [items, setItems] = useState([])
  const [form, setForm] = useState(buildInitialForm(fields))
  const [editing, setEditing] = useState(null)
  const [formOpen, setFormOpen] = useState(false)
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [options, setOptions] = useState({})

  const loadOptions = useCallback(async () => {
    const entries = await Promise.all(
      fields
        .filter((field) => field.loadOptions)
        .map(async (field) => {
          try {
            return [field.name, await field.loadOptions()]
          } catch {
            return [field.name, []]
          }
        }),
    )

    setOptions(Object.fromEntries(entries))
  }, [fields])

  const loadItems = useCallback(async () => {
    setLoading(true)
    setError("")
    try {
      setItems(await api.list())
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [api])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadItems()
    loadOptions()
  }, [loadItems, loadOptions])

  const resetForm = useCallback(() => {
    setForm(buildInitialForm(fields))
    setEditing(null)
    setError("")
  }, [fields])

  const filteredItems = useMemo(() => {
    if (!search) {
      return items
    }

    return items.filter((item) =>
      searchKeys.some((key) => normalize(getNestedValue(item, key)).includes(normalize(search))),
    )
  }, [items, search, searchKeys])

  const handleChange = (event) => {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }))
  }

  const openAdd = () => {
    resetForm()
    setFormOpen(true)
  }

  const handleEdit = (item) => {
    const nextForm = fields.reduce((current, field) => {
      current[field.name] = getNestedValue(item, field.name) ?? emptyValue(field)
      return current
    }, {})

    setEditing(item)
    setForm(nextForm)
    setError("")
    setFormOpen(true)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const closeForm = () => {
    setFormOpen(false)
    resetForm()
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setSaving(true)
    setError("")

    const payload = fields.reduce((data, field) => {
      if (field.type === "password" && editing && !form[field.name]) {
        return data
      }
      data[field.name] = field.type === "number" ? Number(form[field.name] || 0) : form[field.name]
      return data
    }, {})

    try {
      if (editing) {
        await api.update(editing.id, payload)
      } else {
        await api.create(payload)
      }
      closeForm()
      await loadItems()
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (item) => {
    if (!window.confirm(t("res.deleteConfirm", { entity, id: item.id }))) {
      return
    }

    setError("")
    try {
      await api.remove(item.id)
      await loadItems()
    } catch (err) {
      setError(err.message)
    }
  }

  const entity = singular ?? title
  const allFields = fields.map((field) => ({ ...field, options: field.options || options[field.name] || [] }))

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-5 rounded-3xl border border-slate-200/80 bg-white p-6 shadow-[0_1px_2px_rgba(16,24,40,0.04),0_12px_40px_-28px_rgba(16,24,40,0.25)] lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-start gap-4">
          <span className="grid h-12 w-12 flex-none place-items-center rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-600/25">
            <Database size={22} />
          </span>
          <div>
            <p className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-indigo-500">
              {t("res.records")}
            </p>
            <h1 className="mt-0.5 text-2xl font-extrabold tracking-tight text-slate-900">
              {title}
            </h1>
            <p className="mt-1 text-sm text-slate-500">{description}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden items-center gap-2 rounded-xl bg-slate-100 px-4 py-2.5 sm:flex">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            <span className="text-sm font-bold text-slate-700">
              {items.length} {items.length === 1 ? t("res.recordOne") : t("res.recordMany")}
            </span>
          </div>
          <button
            className="inline-flex items-center gap-2 rounded-xl bg-slate-100 px-4 py-2.5 text-sm font-bold text-slate-700 transition-colors hover:bg-slate-200"
            onClick={loadItems}
            type="button"
          >
            <RefreshCw size={16} />
            {t("res.refresh")}
          </button>
          {!formOpen && canCreate && (
            <button
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-indigo-600/30 transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-indigo-600/35"
              onClick={openAdd}
              type="button"
            >
              <Plus size={18} />
              {t("res.add", { entity })}
            </button>
          )}
        </div>
      </div>

      {error && !formOpen && <div className="alert">{error}</div>}

      {/* Inline form */}
      {formOpen && (
        <section className="form-panel overflow-hidden rounded-3xl border border-indigo-200/70 bg-white shadow-[0_1px_2px_rgba(16,24,40,0.04),0_16px_44px_-28px_rgba(79,70,229,0.4)]">
          <div className="flex items-center justify-between gap-4 border-b border-slate-100 px-6 py-5">
            <div className="flex items-center gap-3">
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-600/25">
                {editing ? <Pencil size={19} /> : <Plus size={19} />}
              </span>
              <div>
                <h2 className="text-lg font-extrabold tracking-tight text-slate-900">
                  {editing ? t("res.edit", { entity }) : t("res.addNew", { entity })}
                </h2>
                <p className="text-sm text-slate-500">
                  {editing ? t("res.updateHint") : t("res.createHint", { entity })}
                </p>
              </div>
            </div>
            <button
              className="rounded-xl p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
              onClick={closeForm}
              title="Close"
              type="button"
            >
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="px-6 py-6">
              {error && (
                <div className="mb-5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                {allFields.map((field) => (
                  <label
                    className={`grid gap-2 ${field.type === "textarea" ? "sm:col-span-2" : ""}`}
                    key={field.name}
                  >
                    <span className="text-[13px] font-bold text-slate-600">
                      {field.label}
                      {field.required && <span className="text-rose-500"> *</span>}
                    </span>
                    <FieldControl field={field} form={form} onChange={handleChange} />
                  </label>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-slate-100 bg-slate-50/70 px-6 py-4">
              <button
                className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-bold text-slate-700 transition-colors hover:bg-slate-100"
                onClick={closeForm}
                type="button"
              >
                {t("res.cancel")}
              </button>
              <button
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-indigo-600/30 transition-all hover:-translate-y-0.5 disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60"
                disabled={saving}
                type="submit"
              >
                {saving ? (
                  <>
                    <RefreshCw className="animate-spin" size={16} />
                    {t("res.saving")}
                  </>
                ) : (
                  <>
                    {editing ? <Pencil size={16} /> : <Plus size={16} />}
                    {editing ? t("res.saveChanges") : t("res.create", { entity })}
                  </>
                )}
              </button>
            </div>
          </form>
        </section>
      )}

      {/* Table */}
      <section className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
        <div className="flex flex-col gap-4 border-b border-slate-100 p-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-extrabold text-slate-900">{t("res.list", { title })}</h2>
            <p className="mt-0.5 text-sm text-slate-500">
              {loading
                ? t("res.loading")
                : t("res.showing", { x: filteredItems.length, y: items.length })}
            </p>
          </div>
          <div className="relative w-full sm:w-72">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              aria-label={`Search ${title}`}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-9 text-sm font-semibold text-slate-700 outline-none transition-all placeholder:text-slate-400 focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-500/10"
              onChange={(event) => setSearch(event.target.value)}
              placeholder={t("res.search", { title })}
              value={search}
            />
            {search && (
              <button
                className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
                onClick={() => setSearch("")}
                type="button"
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table>
            <thead>
              <tr>
                {columns.map((column) => (
                  <th key={column.key}>{column.label}</th>
                ))}
                {canManage && <th className="text-right">{t("res.actions")}</th>}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={columns.length + (canManage ? 1 : 0)}>
                    <div className="grid place-items-center gap-3 py-20">
                      <span className="loader" />
                      <p className="text-sm font-semibold text-slate-400">{t("res.loading")}</p>
                    </div>
                  </td>
                </tr>
              ) : filteredItems.length ? (
                filteredItems.map((item) => (
                  <tr key={item.id}>
                    {columns.map((column) => (
                      <td key={column.key}>{formatValue(item, column)}</td>
                    ))}
                    {canManage && (
                      <td>
                        <div className="flex items-center justify-end gap-2">
                          <button
                            className="icon-only"
                            onClick={() => handleEdit(item)}
                            title="Edit"
                            type="button"
                          >
                            <Pencil size={16} />
                          </button>
                          <button
                            className="icon-only danger"
                            onClick={() => handleDelete(item)}
                            title="Delete"
                            type="button"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={columns.length + (canManage ? 1 : 0)}>
                    <div className="grid place-items-center gap-3 py-20 text-slate-400">
                      <span className="grid h-16 w-16 place-items-center rounded-2xl bg-slate-50">
                        <Inbox size={30} />
                      </span>
                      <p className="font-bold">{t("res.noFound", { title })}</p>
                      {canCreate && (
                        <button
                          className="inline-flex items-center gap-2 rounded-xl bg-indigo-50 px-4 py-2 text-sm font-bold text-indigo-600 transition-colors hover:bg-indigo-100"
                          onClick={openAdd}
                          type="button"
                        >
                          <Plus size={16} />
                          {t("res.addFirst", { entity })}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}
