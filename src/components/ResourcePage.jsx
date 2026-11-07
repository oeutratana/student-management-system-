import { Fragment, useCallback, useEffect, useMemo, useState } from "react"
import {
  AlertTriangle,
  ChevronDown,
  Database,
  Inbox,
  LayoutGrid,
  List,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  SlidersHorizontal,
  Trash2,
  X,
} from "lucide-react"
import EntityCard from "./EntityCard"
import Modal from "./Modal"
import RowMenu from "./RowMenu"
import { useAuth } from "../context/AuthContext"
import { useLanguage } from "../context/LanguageContext"
import { useMediaQuery } from "../hooks/useMediaQuery"
import { isAdmin } from "../rolePaths"

const accents = {
  indigo: {
    tile: "from-indigo-600 to-violet-600 shadow-indigo-600/30",
    eyebrow: "text-indigo-600",
    chip: "bg-indigo-50 text-indigo-700 ring-indigo-100",
    blobA: "bg-indigo-300/40",
    blobB: "bg-violet-300/30",
    button: "from-indigo-600 to-violet-600 shadow-indigo-600/30 hover:shadow-indigo-600/40",
  },
  sky: {
    tile: "from-sky-500 to-blue-600 shadow-sky-600/30",
    eyebrow: "text-sky-600",
    chip: "bg-sky-50 text-sky-700 ring-sky-100",
    blobA: "bg-sky-300/40",
    blobB: "bg-blue-300/30",
    button: "from-sky-500 to-blue-600 shadow-sky-600/30 hover:shadow-sky-600/40",
  },
  emerald: {
    tile: "from-emerald-500 to-teal-600 shadow-emerald-600/30",
    eyebrow: "text-emerald-600",
    chip: "bg-emerald-50 text-emerald-700 ring-emerald-100",
    blobA: "bg-emerald-300/40",
    blobB: "bg-teal-300/30",
    button: "from-emerald-500 to-teal-600 shadow-emerald-600/30 hover:shadow-emerald-600/40",
  },
  amber: {
    tile: "from-amber-500 to-orange-600 shadow-amber-600/30",
    eyebrow: "text-amber-600",
    chip: "bg-amber-50 text-amber-700 ring-amber-100",
    blobA: "bg-amber-300/40",
    blobB: "bg-orange-300/30",
    button: "from-amber-500 to-orange-600 shadow-amber-600/30 hover:shadow-amber-600/40",
  },
  rose: {
    tile: "from-rose-500 to-red-600 shadow-rose-600/30",
    eyebrow: "text-rose-600",
    chip: "bg-rose-50 text-rose-700 ring-rose-100",
    blobA: "bg-rose-300/40",
    blobB: "bg-red-300/30",
    button: "from-rose-500 to-red-600 shadow-rose-600/30 hover:shadow-rose-600/40",
  },
}

const statTones = {
  indigo: "from-indigo-500 to-violet-500 shadow-indigo-500/25",
  violet: "from-violet-500 to-purple-500 shadow-violet-500/25",
  emerald: "from-emerald-500 to-teal-500 shadow-emerald-500/25",
  sky: "from-sky-500 to-blue-500 shadow-sky-500/25",
  amber: "from-amber-500 to-orange-500 shadow-amber-500/25",
  rose: "from-rose-500 to-red-500 shadow-rose-500/25",
  slate: "from-slate-500 to-slate-700 shadow-slate-500/25",
}

const emptyValue = (field) => field.defaultValue ?? ""

const getNestedValue = (item, path) =>
  path.split(".").reduce((value, key) => value?.[key], item)

const normalize = (value) => String(value ?? "").toLowerCase()

const buildInitialForm = (fields) =>
  fields.reduce((form, field) => ({ ...form, [field.name]: emptyValue(field) }), {})

// A field may derive its value from the others (a total, a letter grade, ...).
// Fields are folded in declaration order so a later field can read an earlier
// computed one without the page having to duplicate the calculation.
const applyComputedFields = (fields, values) =>
  fields.reduce((form, field) => {
    if (typeof field.compute === "function") {
      form[field.name] = field.compute(form)
    }
    return form
  }, { ...values })

const formatValue = (item, column) => {
  if (column.render) {
    return column.render(item)
  }
  const value = getNestedValue(item, column.key)
  if (value === undefined || value === null || value === "") {
    return "-"
  }
  if (column.key === "amount" && !Number.isNaN(Number(value))) {
    return `$${Number(value).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }
  return value
}

const formatError = (err) => {
  const errors = err?.errors
  if (errors && typeof errors === "object") {
    const list = Object.values(errors)
      .flat()
      .filter(Boolean)
    if (list.length) {
      return list.join(" • ")
    }
  }
  return err?.message || "API request failed"
}

const getItemIdentifier = (item) => {
  if (!item) return ""
  const fullName = [item.first_name, item.last_name].filter(Boolean).join(" ")
  if (fullName) return fullName
  const studentName = [item.student?.first_name, item.student?.last_name]
    .filter(Boolean)
    .join(" ")
  const enrolledStudent = [item.enrollment?.student?.first_name, item.enrollment?.student?.last_name]
    .filter(Boolean)
    .join(" ")
  return (
    item.name ||
    item.class_name ||
    item.course_name ||
    item.exam_name ||
    item.title ||
    studentName ||
    item.student?.student_code ||
    item.course?.course_name ||
    enrolledStudent ||
    item.enrollment?.course?.course_name ||
    item.fee_type ||
    item.receipt_no ||
    item.father_name ||
    item.mother_name ||
    item.code ||
    item.teacher_code ||
    item.student_code ||
    item.email ||
    ""
  )
}

const getItemSubtitle = (item) => {
  if (!item) return ""
  const parts = []
  if (item.student_code) parts.push(item.student_code)
  if (item.teacher_code) parts.push(item.teacher_code)
  if (item.code) parts.push(item.code)
  if (item.email) parts.push(item.email)
  if (item.department?.name) parts.push(item.department.name)
  if (item.class?.class_name) parts.push(item.class.class_name)
  if (item.amount !== undefined && item.amount !== null && item.amount !== "") {
    parts.push(`$${Number(item.amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`)
  }
  return parts.filter(Boolean).join(" · ")
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

  if (field.name === "amount" || field.prefix === "$") {
    return (
      <div className="relative">
        <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">
          $
        </span>
        <input
          {...shared}
          aria-readonly={field.readOnly || undefined}
          max={field.max}
          min={field.min ?? "0"}
          placeholder={t("res.enter", { label: field.label })}
          readOnly={field.readOnly}
          required={field.required}
          step={field.step ?? "0.01"}
          style={{ paddingLeft: "1.75rem" }}
          type={field.type || "number"}
        />
      </div>
    )
  }

  return (
    <input
      {...shared}
      aria-readonly={field.readOnly || undefined}
      max={field.max}
      min={field.min}
      placeholder={t("res.enter", { label: field.label })}
      readOnly={field.readOnly}
      required={field.required}
      step={field.step}
      type={field.type || "text"}
    />
  )
}

/**
 * One record as a card, used instead of a table row on a narrow screen.
 *
 * The columns are the same descriptors the table uses, so both views show the
 * same fields with the same formatting. The first column that carries a value
 * becomes the headline of the card and the rest are listed underneath it.
 */
const RecordCard = ({ item, columns, actions }) => {
  const photoColumn = columns.find((column) => column.key === "image")
  const headlineColumn = columns.find((column) => column.key !== "id" && column.key !== "image")
  const identifier = getItemIdentifier(item)
  const columnValue = headlineColumn ? formatValue(item, headlineColumn) : ""
  // The record names itself when it can; otherwise the first column that holds
  // something takes its place as the title of the card.
  const fromColumn = !identifier && columnValue !== "" && columnValue !== "-"
  const headline = identifier || (fromColumn ? columnValue : "")
  const hasHeadline = Boolean(headline) && headline !== "-"

  const details = columns.filter((column) => {
    if (column.key === "id" || column === photoColumn) return false
    if (fromColumn && column === headlineColumn) return false
    // A column that repeats the title is noise, not information.
    const value = formatValue(item, column)
    return !(typeof value === "string" && value === headline)
  })

  return (
    <article className="rp-card">
      <header className="rp-card__head">
        {photoColumn && <span className="rp-card__photo">{formatValue(item, photoColumn)}</span>}

        <div className="min-w-0 flex-1">
          {hasHeadline && <p className="rp-card__title">{headline}</p>}
          <p className="rp-card__id">#{item.id}</p>
        </div>

        {actions}
      </header>

      {details.length > 0 && (
        <dl className="rp-card__list">
          {details.map((column) => (
            <div className="rp-card__row" key={column.key}>
              <dt className="rp-card__label">{column.label}</dt>
              <dd className="rp-card__value">{formatValue(item, column)}</dd>
            </div>
          ))}
        </dl>
      )}
    </article>
  )
}

/**
 * The card every resource gets in grid view unless the page provides its own.
 *
 * It reuses the column descriptors, so the card shows the same values as the
 * table without each page having to describe its record twice. Pages with a
 * richer record (students, classes) still pass their own `gridCard`.
 */
const DefaultGridCard = ({ item, columns, actions, tone }) => {
  const photoColumn = columns.find((column) => column.key === "image")
  const headlineColumn = columns.find((column) => column.key !== "id" && column.key !== "image")
  const headlineValue = headlineColumn ? formatValue(item, headlineColumn) : ""
  const columnTitle =
    typeof headlineValue === "string" && headlineValue !== "" && headlineValue !== "-"
      ? headlineValue
      : ""
  const title = getItemIdentifier(item) || columnTitle || `#${item.id}`
  const subtitle = getItemSubtitle(item)

  const fields = columns
    .filter((column) => column.key !== "id" && column !== photoColumn)
    .map((column) => ({
      key: column.key,
      label: column.label,
      value: formatValue(item, column),
    }))
    .filter((field) => field.value !== undefined && field.value !== null && field.value !== "" && field.value !== "-")
    .filter((field) => typeof field.value !== "string" || field.value !== title)
    .slice(0, 6)

  const photo = photoColumn ? formatValue(item, photoColumn) : null
  const initials = String(title).charAt(0).toUpperCase() || "#"

  return (
    <EntityCard
      actions={actions}
      fields={fields}
      icon={
        photo ?? (
          <span className="text-lg font-extrabold">{initials}</span>
        )
      }
      subtitle={subtitle && subtitle !== title ? subtitle : null}
      title={title}
      tone={tone}
    />
  )
}

// `viewAction` and `rowActions` both return RowMenu item descriptors
// (`{ key, label, icon, onSelect, disabled, danger }`) rather than markup.
// `viewAction` renders for anyone who can see the list; `rowActions` is gated
// behind `managePermission`, as edit and delete are.
//
// `filters` narrows the loaded list client-side, so it is a `select` per entry:
// `{ key, label, options?, optionsFrom?, match? }`. `key` is a dotted path read
// with getNestedValue; `optionsFrom` borrows the options already fetched for a
// form field (avoids a second request); `match(item, value)` overrides the
// default equality test for computed values such as booleans.
export default function ResourcePage({ title, description, api, fields, createFields, columns, searchKeys = [], filters = [], initialFilters = {}, managePermission, createPermission, singular, onCreated, onOpenCreate, rowActions, viewAction, formNote, emptyMessage, gridCard, gridTone, defaultView = "list", accent = "indigo", stats }) {
  const { user } = useAuth()
  const { t } = useLanguage()
  // A table with seven columns cannot be read on a phone, so the list becomes a
  // stack of cards there. The breakpoint matches the one the stylesheet uses
  // for the rest of the layout.
  const compact = useMediaQuery("(max-width: 639px)")
  // Admin bypass comes from the normalised role of the authenticated user, so a
  // missing or unexpected role grants nothing instead of granting everything.
  const admin = isAdmin(user)
  const canManage =
    !managePermission ||
    admin ||
    (user?.permissions ?? []).includes(managePermission)
  const canCreate =
    !createPermission
      ? canManage
      : admin || (user?.permissions ?? []).includes(createPermission)

  const entity = singular ?? title
  const hasGrid = typeof gridCard === "function" || Array.isArray(columns)

  // Some resources collect much less when they are created than when they are
  // edited, so the create form may declare its own, narrower set of fields.
  const addFields = useMemo(() => createFields ?? fields, [createFields, fields])
  const editFields = fields

  const [items, setItems] = useState([])
  const [form, setForm] = useState(buildInitialForm(addFields))
  const [editing, setEditing] = useState(null)
  const [formOpen, setFormOpen] = useState(false)
  const [search, setSearch] = useState("")
  const [view, setView] = useState(hasGrid ? defaultView : "list")
  const [filterValues, setFilterValues] = useState(initialFilters)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [options, setOptions] = useState({})
  const [itemToDelete, setItemToDelete] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState("")

  const loadOptions = useCallback(async () => {
    const entries = await Promise.all(
      editFields
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
  }, [editFields])

  const loadItems = useCallback(async () => {
    setLoading(true)
    setError("")
    try {
      setItems(await api.list())
    } catch (err) {
      setError(formatError(err))
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
    setForm(applyComputedFields(addFields, buildInitialForm(addFields)))
    setEditing(null)
    setError("")
  }, [addFields])

  const filterOptions = useMemo(
    () =>
      Object.fromEntries(
        filters.map((filter) => [
          filter.key,
          filter.options ?? options[filter.optionsFrom] ?? [],
        ]),
      ),
    [filters, options],
  )

  const activeFilterCount = filters.filter(
    (filter) => filterValues[filter.key] !== undefined && filterValues[filter.key] !== "",
  ).length

  const filteredItems = useMemo(() => {
    const active = filters.filter(
      (filter) => filterValues[filter.key] !== undefined && filterValues[filter.key] !== "",
    )

    return items.filter((item) => {
      if (
        search &&
        !searchKeys.some((key) => {
          const value = typeof key === "function" ? key(item) : getNestedValue(item, key)
          return normalize(value).includes(normalize(search))
        })
      ) {
        return false
      }

      return active.every((filter) =>
        filter.match
          ? filter.match(item, filterValues[filter.key])
          : normalize(getNestedValue(item, filter.key)) === normalize(filterValues[filter.key]),
      )
    })
  }, [items, search, searchKeys, filters, filterValues])

  const theme = accents[accent] ?? accents.indigo

  // The stats strip is described by the page, so the numbers stay next to the
  // data they summarise. A page that does not ask for stats renders nothing.
  const statCards = useMemo(
    () => (typeof stats === "function" ? stats(items, filteredItems) : stats ?? []),
    [stats, items, filteredItems],
  )

  const clearFilters = () => setFilterValues({})

  // The create form may declare fewer fields than the edit form.
  const activeFields = editing ? editFields : addFields

  const handleChange = (event) => {
    const changedField = activeFields.find((field) => field.name === event.target.name)
    if (changedField?.readOnly) return

    setForm((current) =>
      applyComputedFields(activeFields, { ...current, [event.target.name]: event.target.value }),
    )
  }

  const openAdd = () => {
    resetForm()
    setFormOpen(true)
    onOpenCreate?.()
  }

  const handleEdit = (item) => {
    const nextForm = editFields.reduce((current, field) => {
      current[field.name] = getNestedValue(item, field.name) ?? emptyValue(field)
      return current
    }, {})

    setEditing(item)
    setForm(applyComputedFields(editFields, nextForm))
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

    const payload = activeFields.reduce((data, field) => {
      if (field.type === "password" && editing && !form[field.name]) {
        return data
      }
      // An untouched required number is sent empty so the API rejects it instead
      // of recording a false zero. Optional numbers keep the old zero default.
      const blank =
        form[field.name] === "" || form[field.name] === null || form[field.name] === undefined
      data[field.name] =
        field.type === "number"
          ? blank
            ? field.required
              ? ""
              : 0
            : Number(form[field.name])
          : form[field.name]
      return data
    }, {})

    try {
      let result = null
      if (editing) {
        await api.update(editing.id, payload)
      } else {
        result = await api.create(payload)
      }
      closeForm()
      await loadItems()
      if (result && onCreated) {
        onCreated(result)
      }
    } catch (err) {
      setError(formatError(err))
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = (item) => {
    setItemToDelete(item)
    setDeleteError("")
  }

  const cancelDelete = () => {
    if (deleting) return
    setItemToDelete(null)
    setDeleteError("")
  }

  const confirmDelete = async () => {
    if (!itemToDelete) return
    setDeleting(true)
    setDeleteError("")
    try {
      await api.remove(itemToDelete.id)
      setItemToDelete(null)
      await loadItems()
    } catch (err) {
      setDeleteError(formatError(err))
    } finally {
      setDeleting(false)
    }
  }

  const allFields = activeFields.map((field) => ({ ...field, options: field.options || options[field.name] || [] }))

  // The actions of a record are the same whether it is shown as a table row or
  // as a card, so they are described once and used by both views.
  const rowMenuItems = (item) => [
    ...(viewAction?.(item) ?? []),
    ...(canManage
      ? [
          ...(rowActions?.(item) ?? []),
          {
            key: "edit",
            label: t("res.editAction"),
            icon: <Pencil size={16} />,
            onSelect: () => handleEdit(item),
          },
          {
            key: "delete",
            label: t("res.deleteAction"),
            icon: <Trash2 size={16} />,
            danger: true,
            onSelect: () => handleDelete(item),
          },
        ]
      : []),
  ]

  const searchControl = (
    <div className="relative w-full sm:w-64 lg:w-72">
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
  )

  const viewSwitch = (
    <div
      aria-label={t("res.viewMode")}
      className="inline-flex shrink-0 items-center gap-1 rounded-xl border border-slate-200 bg-slate-100/80 p-1"
      role="group"
    >
      <button
        aria-pressed={view === "grid"}
        className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-bold transition-colors ${
          view === "grid"
            ? "bg-slate-900 text-white shadow-sm"
            : "text-slate-500 hover:bg-white hover:text-slate-800"
        }`}
        onClick={() => setView("grid")}
        title={t("res.gridView")}
        type="button"
      >
        <LayoutGrid size={15} />
        <span className="hidden sm:inline">{t("res.gridView")}</span>
      </button>
      <button
        aria-pressed={view === "list"}
        className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-bold transition-colors ${
          view === "list"
            ? "bg-slate-900 text-white shadow-sm"
            : "text-slate-500 hover:bg-white hover:text-slate-800"
        }`}
        onClick={() => setView("list")}
        title={t("res.listView")}
        type="button"
      >
        <List size={15} />
        <span className="hidden sm:inline">{t("res.listView")}</span>
      </button>
    </div>
  )

  const gridEmptyState = (
    <div className="grid place-items-center gap-3 py-14 text-slate-400">
      <span className="grid h-16 w-16 place-items-center rounded-2xl bg-white shadow-sm">
        <Inbox size={30} />
      </span>
      <p className="font-bold">{emptyMessage || t("res.noFound", { title })}</p>
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
  )

  const gridLoadingState = (
    <div className="grid place-items-center gap-3 py-14">
      <span className="loader" />
      <p className="text-sm font-semibold text-slate-400">{t("res.loading")}</p>
    </div>
  )

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="relative overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-[0_1px_2px_rgba(16,24,40,0.04),0_18px_50px_-32px_rgba(16,24,40,0.35)]">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className={`absolute -right-20 -top-28 h-64 w-64 rounded-full bg-gradient-to-br ${theme.blobA} to-transparent blur-3xl`} />
          <div className={`absolute -bottom-28 left-1/4 h-60 w-60 rounded-full ${theme.blobB} blur-3xl`} />
        </div>

        <div className="relative flex flex-col gap-5 p-5 sm:p-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-4">
            <span className={`grid h-14 w-14 flex-none place-items-center rounded-2xl bg-gradient-to-br text-white shadow-lg ${theme.tile}`}>
              <Database size={24} />
            </span>
            <div className="min-w-0">
              <p className={`text-[11px] font-extrabold uppercase tracking-[0.16em] ${theme.eyebrow}`}>
                {t("res.records")}
              </p>
              <h1 className="mt-0.5 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
                {title}
              </h1>
              <p className="mt-1 max-w-xl text-sm text-slate-500">{description}</p>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ring-1 ring-inset ${theme.chip}`}>
                  <span className="h-1.5 w-1.5 rounded-full bg-current" />
                  {items.length} {items.length === 1 ? t("res.recordOne") : t("res.recordMany")}
                </span>
                {(search || activeFilterCount > 0) && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-500">
                    {t("res.showing", { x: filteredItems.length, y: items.length })}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 lg:justify-end">
            {hasGrid && searchControl}
            <button
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 transition-colors hover:bg-slate-100"
              onClick={loadItems}
              type="button"
            >
              <RefreshCw size={16} />
              {t("res.refresh")}
            </button>
            {!formOpen && canCreate && (
              <button
                className={`inline-flex items-center gap-2 rounded-xl bg-gradient-to-r px-5 py-2.5 text-sm font-bold text-white shadow-lg transition-all hover:-translate-y-0.5 hover:shadow-xl ${theme.button}`}
                onClick={openAdd}
                type="button"
              >
                <Plus size={18} />
                {t("res.add", { entity })}
              </button>
            )}
          </div>
        </div>
      </div>

      {statCards.length > 0 && (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {statCards.map((stat, index) => {
            const Icon = stat.icon
            return (
              <div
                className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-4 shadow-[0_1px_2px_rgba(16,24,40,0.04)] transition-all hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-[0_12px_32px_-20px_rgba(16,24,40,0.45)]"
                key={stat.key ?? index}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-[11px] font-extrabold uppercase tracking-[0.12em] text-slate-400">
                      {stat.label}
                    </p>
                    <p className="mt-1.5 truncate text-3xl font-extrabold tracking-tight text-slate-900">
                      {stat.value}
                    </p>
                    {stat.hint && (
                      <p className="mt-0.5 truncate text-xs font-semibold text-slate-400">{stat.hint}</p>
                    )}
                  </div>
                  {Icon && (
                    <span className={`grid h-10 w-10 flex-none place-items-center rounded-xl bg-gradient-to-br text-white shadow-lg ${statTones[stat.tone] ?? statTones.indigo}`}>
                      <Icon size={18} />
                    </span>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {error && !formOpen && <div className="alert">{error}</div>}

      {/* Inline form */}
      {formOpen && (
        <section className="form-panel overflow-hidden rounded-3xl border border-indigo-200/70 bg-white shadow-[0_1px_2px_rgba(16,24,40,0.04),0_16px_44px_-28px_rgba(79,70,229,0.4)]">
          <div className="flex items-center justify-between gap-4 border-b border-slate-100 px-4 py-4 sm:px-6 sm:py-5">
            <div className="flex items-center gap-3">
              <span className={`grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br text-white shadow-md ${theme.tile}`}>
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
            <div className="px-4 py-5 sm:px-6 sm:py-6">
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

              {formNote && !editing && (
                <p className="mt-4 text-xs font-medium text-slate-500 italic">
                  {formNote}
                </p>
              )}
            </div>

            <div className="flex flex-wrap items-center justify-end gap-3 border-t border-slate-100 bg-slate-50/70 px-4 py-4 sm:px-6">
              <button
                className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-bold text-slate-700 transition-colors hover:bg-slate-100"
                onClick={closeForm}
                type="button"
              >
                {t("res.cancel")}
              </button>
              <button
                className={`inline-flex items-center gap-2 rounded-xl bg-gradient-to-r px-6 py-2.5 text-sm font-bold text-white shadow-lg transition-all hover:-translate-y-0.5 disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60 ${theme.button}`}
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
      <section
        className={`rounded-3xl border border-slate-200/80 bg-white shadow-[0_1px_2px_rgba(16,24,40,0.04)]${
          compact ? "" : " overflow-hidden"
        }`}
      >
        <div className="flex flex-col gap-4 border-b border-slate-100 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <div>
            <h2 className="text-lg font-extrabold text-slate-900">
              {hasGrid && view === "grid" ? title : t("res.list", { title })}
            </h2>
            <p className="mt-0.5 text-sm text-slate-500">
              {loading
                ? t("res.loading")
                : t("res.showing", { x: filteredItems.length, y: items.length })}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {!hasGrid && searchControl}
            {hasGrid && viewSwitch}
          </div>
        </div>

        {filters.length > 0 && (
          <div className="flex flex-wrap items-center gap-3 border-b border-slate-100 bg-slate-50/60 px-4 py-3 sm:px-6 sm:py-3.5">
            <span className="inline-flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-[0.12em] text-slate-400">
              <SlidersHorizontal size={14} />
              {t("res.filters")}
            </span>

            {filters.map((filter) => (
              <label className="relative" key={filter.key}>
                <span className="sr-only">{filter.label}</span>
                <select
                  aria-label={filter.label}
                  className={`appearance-none rounded-lg border bg-white py-1.5 pl-3 pr-8 text-xs font-bold outline-none transition-colors focus:ring-4 focus:ring-indigo-500/10 ${
                    filterValues[filter.key]
                      ? "border-indigo-300 text-indigo-700"
                      : "border-slate-200 text-slate-600"
                  }`}
                  onChange={(event) =>
                    setFilterValues((current) => ({ ...current, [filter.key]: event.target.value }))
                  }
                  value={filterValues[filter.key] ?? ""}
                >
                  <option value="">{t("res.filterAll", { label: filter.label })}</option>
                  {filterOptions[filter.key].map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400"
                  size={13}
                />
              </label>
            ))}

            {activeFilterCount > 0 && (
              <button
                className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-bold text-slate-500 transition-colors hover:bg-white hover:text-rose-600"
                onClick={clearFilters}
                type="button"
              >
                <X size={13} />
                {t("res.clearFilters")}
              </button>
            )}
          </div>
        )}

        {hasGrid && view === "grid" ? (
          <div className="bg-slate-50/40 p-4 sm:p-6">
            {loading ? (
              gridLoadingState
            ) : filteredItems.length ? (
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {filteredItems.map((item) => {
                  const cardProps = {
                    actions:
                      canManage || viewAction ? <RowMenu items={rowMenuItems(item)} /> : null,
                    canManage,
                  }

                  return (
                    <Fragment key={item.id}>
                      {gridCard ? (
                        gridCard(item, cardProps)
                      ) : (
                        <DefaultGridCard
                          actions={cardProps.actions}
                          columns={columns}
                          item={item}
                          tone={gridTone}
                        />
                      )}
                    </Fragment>
                  )
                })}
              </div>
            ) : (
              gridEmptyState
            )}
          </div>
        ) : compact && view === "list" ? (
          <div className="rp-cards">
            {loading ? (
              <div className="grid place-items-center gap-3 py-14">
                <span className="loader" />
                <p className="text-sm font-semibold text-slate-400">{t("res.loading")}</p>
              </div>
            ) : filteredItems.length ? (
              filteredItems.map((item) => (
                <RecordCard
                  actions={(canManage || viewAction) ? <RowMenu items={rowMenuItems(item)} /> : null}
                  columns={columns}
                  item={item}
                  key={item.id}
                />
              ))
            ) : (
              <div className="grid place-items-center gap-3 py-14 text-slate-400">
                <span className="grid h-16 w-16 place-items-center rounded-2xl bg-slate-50">
                  <Inbox size={30} />
                </span>
                <p className="font-bold">{emptyMessage || t("res.noFound", { title })}</p>
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
            )}
          </div>
        ) : (
        <div className="overflow-x-auto">
          <table className={hasGrid ? "min-w-[760px]" : undefined}>
            <thead>
              <tr>
                {columns.map((column) => (
                  <th key={column.key}>{column.label}</th>
                ))}
                {(canManage || viewAction) && <th className="text-right">{t("res.actions")}</th>}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={columns.length + (canManage || viewAction ? 1 : 0)}>
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
                    {(canManage || viewAction) && (
                      <td className="text-right">
                        <RowMenu items={rowMenuItems(item)} />
                      </td>
                    )}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={columns.length + (canManage || viewAction ? 1 : 0)}>
                    <div className="grid place-items-center gap-3 py-20 text-slate-400">
                      <span className="grid h-16 w-16 place-items-center rounded-2xl bg-slate-50">
                        <Inbox size={30} />
                      </span>
                      <p className="font-bold">{emptyMessage || t("res.noFound", { title })}</p>
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
        )}
      </section>

      {/* Delete Confirmation Popup */}
      <Modal
        icon={
          <span className="grid h-11 w-11 flex-none place-items-center rounded-2xl border border-rose-100 bg-rose-50 text-rose-600 shadow-sm">
            <AlertTriangle size={22} className="text-rose-600" />
          </span>
        }
        onClose={cancelDelete}
        open={Boolean(itemToDelete)}
        size="max-w-md"
        subtitle={itemToDelete ? `${entity} #${itemToDelete.id}` : ""}
        title={t("res.deleteTitle", { entity })}
        footer={
          <>
            <button
              className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-bold text-slate-700 transition-colors hover:bg-slate-100 disabled:opacity-50"
              disabled={deleting}
              onClick={cancelDelete}
              type="button"
            >
              {t("res.cancel")}
            </button>
            <button
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-rose-600/30 transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-rose-600/40 disabled:translate-y-0 disabled:opacity-60 disabled:cursor-not-allowed"
              disabled={deleting}
              onClick={confirmDelete}
              type="button"
            >
              {deleting ? (
                <>
                  <RefreshCw className="animate-spin" size={16} />
                  {t("res.deleting")}
                </>
              ) : (
                <>
                  <Trash2 size={16} />
                  {t("res.deleteAction")}
                </>
              )}
            </button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          {deleteError && (
            <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
              {deleteError}
            </div>
          )}

          <p className="text-sm font-semibold text-slate-700">
            {t("res.deleteWarning", { entity })}
          </p>

          {itemToDelete && (
            <div className="rounded-2xl border border-slate-100 bg-slate-50/80 p-4">
              <div className="flex items-center justify-between gap-2 text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                <span>{entity}</span>
                <span>#{itemToDelete.id}</span>
              </div>
              {getItemIdentifier(itemToDelete) && (
                <p className="mt-1.5 text-base font-extrabold text-slate-900 break-words">
                  {getItemIdentifier(itemToDelete)}
                </p>
              )}
              {getItemSubtitle(itemToDelete) && (
                <p className="mt-1 text-xs font-semibold text-slate-500 break-words">
                  {getItemSubtitle(itemToDelete)}
                </p>
              )}
            </div>
          )}

          <div className="flex items-start gap-2.5 rounded-xl border border-amber-200/60 bg-amber-50/60 p-3 text-xs font-medium text-amber-800">
            <span className="mt-0.5 h-1.5 w-1.5 flex-none rounded-full bg-amber-500" />
            <span>{t("res.deleteIrreversible")}</span>
          </div>
        </div>
      </Modal>
    </div>
  )
}
