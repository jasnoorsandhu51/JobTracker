'use client'

import { useState, useEffect, useMemo, useRef, useCallback } from 'react'
import {
    useReactTable,
    getCoreRowModel,
    flexRender,
    createColumnHelper,
} from '@tanstack/react-table'
import { loadApplications as loadApps, createApplication, updateApplication, deleteApplication } from './actions'

const easterEggs = [
    "The 'Submit' button is your new best friend.",
    "Your future self is already at the office, waiting for you to finish this application.",
    "One 'Yes' is all you need to change your entire life.",
    "You miss 100% of the roles you don't apply for.",
    "Your dream job doesn't have your resume yet. Fix that.",
    "Success is just a series of 'Submits' away.",
    "Dress for the job you want, but apply for it in your pajamas.",
    "The expert in anything was once a nervous applicant.",
    "May your 'Quick Apply' buttons actually be quick.",
    "Currently seeking a job where my only responsibility is 'vibing'.",
    "I have 10 years of experience in being 22 years old.",
    "My resume is just a list of things I never want to do again.",
    "Entry level: Requires 5 years of experience and a Nobel Prize.",
    "I'm not unemployed, I'm a 'Private Consultant for my own Couch'.",
    "Applying to jobs: The only sport where you're ghosted more than on Tinder.",
    "Status: 404 - Job Not Found (Yet).",
    "Compiling your career... Please wait.",
    "Your resume is looking sharper than a fresh set of Tailwind classes.",
    "Error 200: User is too talented for this rejection letter.",
    "Importing 'Coffee'... Exporting 'Productivity'.",
    "git commit -m 'Applied to my dream job'.",
    "You're the !important of this application cycle.",
    "Go touch some grass, then touch some 'Submit' buttons.",
    "Manifesting a 'We'd like to schedule an interview' email for you.",
    "Your talent is a feature, not a bug.",
    "Keep going. Even the WiFi struggles sometimes.",
    "You are more than a PDF.",
    "Rejection is just redirection in a fancy suit.",
    "Apply today. Nap tomorrow.",
    "Building a career, one row at a time."
]

type Application = {
    id?: string
    company: string
    role: string
    status: string
    location?: string
    applied_at: string
    link?: string
    tags?: string[]
    notes: string
    custom_fields?: Record<string, any>
    user_id?: string
}

const columnHelper = createColumnHelper<Application>()

export default function JobTrackerTable({ userId }: { userId: string }) {
    const [apps, setApps] = useState<Application[]>([])
    const [newRow, setNewRow] = useState<Application>({
        company: '',
        role: '',
        status: 'Applied',
        applied_at: new Date().toISOString().split('T')[0],
        notes: '',
        custom_fields: {},
    })
    const [editingId, setEditingId] = useState<string | null>(null)
    const [showError, setShowError] = useState(false)
    const [expandedNotes, setExpandedNotes] = useState<{ id: string; company: string; role: string; notes: string } | null>(null)
    const [editedNotes, setEditedNotes] = useState('')
    const [isEditingNotes, setIsEditingNotes] = useState(false)
    const [showNewRow, setShowNewRow] = useState(false)
    const [showCustomizeModal, setShowCustomizeModal] = useState(false)
    const [customColumns, setCustomColumns] = useState<{ id: string; name: string }[]>([])
    const [newColumnName, setNewColumnName] = useState('')
    const [draggedColumn, setDraggedColumn] = useState<string | null>(null)
    const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'idle'>('idle')
    const [editingData, setEditingData] = useState<Record<string, Partial<Application>>>({})
    const saveTimeoutRef = useRef<Record<string, NodeJS.Timeout>>({})
    const [openStatusDropdown, setOpenStatusDropdown] = useState<string | null>(null)
    const [activeTab, setActiveTab] = useState<'applications' | 'stats'>('applications')
    const [hoveredStatus, setHoveredStatus] = useState<string | null>(null)
    const [isScrolling, setIsScrolling] = useState(false)
    const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null)

    // Generate dynamic columns based on core + custom columns
    const columns = useMemo(() => {
        const coreColumns = [
            columnHelper.accessor('company', {
                header: 'Company',
                cell: (info) => info.getValue(),
                size: 200,
            }),
            columnHelper.accessor('role', {
                header: 'Position',
                cell: (info) => info.getValue(),
                size: 200,
            }),
            columnHelper.accessor('status', {
                header: 'Status',
                cell: (info) => info.getValue(),
                size: 150,
            }),
            columnHelper.accessor('applied_at', {
                header: 'Date Applied',
                cell: (info) => info.getValue(),
                size: 140,
            }),
            columnHelper.accessor('notes', {
                header: 'Notes',
                cell: (info) => info.getValue(),
                size: 200,
            }),
        ]

        // Add custom columns dynamically
        const dynamicColumns = customColumns.map((col) =>
            columnHelper.display({
                id: col.id,
                header: col.name,
                cell: (props) => {
                    const customFields = props.row.original.custom_fields || {}
                    return customFields[col.id] || ''
                },
            })
        )

        return [...coreColumns, ...dynamicColumns]
    }, [customColumns])

    const table = useReactTable({
        data: apps,
        columns,
        getCoreRowModel: getCoreRowModel(),
    })

    // Load applications on mount
    useEffect(() => {
        loadApplications()
    }, [])

    const loadApplications = async () => {
        const data = await loadApps()
        setApps(data)
    }

    const debouncedSave = useCallback(async (id: string, updates: Partial<Application>) => {
        // Clear existing timeout for this row
        if (saveTimeoutRef.current[id]) {
            clearTimeout(saveTimeoutRef.current[id])
        }

        // Set saving status
        setSaveStatus('saving')

        // Create new timeout
        saveTimeoutRef.current[id] = setTimeout(async () => {
            const result = await updateApplication(id, updates)

            if (result.error) {
                console.error('Failed to save:', result.error)
                setSaveStatus('idle')
                return
            }

            // Update local state with saved data
            setApps(prevApps =>
                prevApps.map(app =>
                    app.id === id ? { ...app, ...updates } : app
                )
            )

            // Clear editing data for this row
            setEditingData(prev => {
                const newData = { ...prev }
                delete newData[id]
                return newData
            })

            setSaveStatus('saved')
            setTimeout(() => setSaveStatus('idle'), 2000)
            delete saveTimeoutRef.current[id]
        }, 1500) // 1.5 second debounce
    }, [])

    const handleCellEdit = (id: string, field: keyof Application, value: any) => {
        // Update editing data
        setEditingData(prev => ({
            ...prev,
            [id]: { ...prev[id], [field]: value }
        }))

        // Trigger debounced save
        debouncedSave(id, { [field]: value })
    }

    const handleCustomFieldEdit = (id: string, fieldId: string, value: string) => {
        const app = apps.find(a => a.id === id)
        const updatedCustomFields = {
            ...app?.custom_fields,
            [fieldId]: value
        }

        setEditingData(prev => ({
            ...prev,
            [id]: { ...prev[id], custom_fields: updatedCustomFields }
        }))

        debouncedSave(id, { custom_fields: updatedCustomFields })
    }

    const getStatusStyles = (status: string) => {
        switch (status) {
            case 'Applied':
                return 'bg-gray-500/10 border-gray-500/30 text-gray-300 hover:border-gray-500/50'
            case 'Interview':
                return 'bg-purple-500/10 border-purple-500/30 text-purple-300 hover:border-purple-500/50'
            case 'Offer':
                return 'bg-green-500/10 border-green-500/30 text-green-300 hover:border-green-500/50'
            case 'Rejected':
                return 'bg-pink-500/10 border-pink-500/30 text-pink-300 hover:border-pink-500/50'
            default:
                return 'bg-gray-500/10 border-gray-500/30 text-gray-300'
        }
    }

    const StatusBadge = ({ status, rowId, onChange }: { status: string; rowId: string; onChange: (value: string) => void }) => {
        const isOpen = openStatusDropdown === rowId
        const statuses = ['Applied', 'Interview', 'Offer', 'Rejected']
        const buttonRef = useRef<HTMLButtonElement>(null)
        const [dropdownPosition, setDropdownPosition] = useState<{ top: number; left: number }>({ top: 0, left: 0 })

        useEffect(() => {
            if (isOpen && buttonRef.current) {
                const rect = buttonRef.current.getBoundingClientRect()
                const dropdownHeight = 180 // Approximate height of dropdown
                const spaceBelow = window.innerHeight - rect.bottom
                const spaceAbove = rect.top

                // Position dropdown above if not enough space below
                const shouldOpenUpward = spaceBelow < dropdownHeight && spaceAbove > spaceBelow

                setDropdownPosition({
                    top: shouldOpenUpward ? rect.top - dropdownHeight : rect.bottom + 4,
                    left: rect.left
                })
            }
        }, [isOpen])

        return (
            <>
                <button
                    ref={buttonRef}
                    onClick={() => setOpenStatusDropdown(isOpen ? null : rowId)}
                    className={`px-3 py-1.5 rounded-lg border backdrop-blur-sm text-xs font-medium transition-all ${getStatusStyles(status)
                        }`}
                >
                    {status}
                </button>
                {isOpen && (
                    <>
                        <div
                            className="fixed inset-0 z-[100]"
                            onClick={() => setOpenStatusDropdown(null)}
                        />
                        <div
                            className="fixed z-[101] min-w-[120px] rounded-lg border border-purple-500/30 bg-black/95 backdrop-blur-lg shadow-xl overflow-hidden"
                            style={{
                                top: `${dropdownPosition.top}px`,
                                left: `${dropdownPosition.left}px`
                            }}
                        >
                            {statuses.map((s) => (
                                <button
                                    key={s}
                                    onClick={() => {
                                        onChange(s)
                                        setOpenStatusDropdown(null)
                                    }}
                                    className={`w-full px-3 py-2 text-left text-xs font-medium transition-colors ${s === status
                                        ? 'bg-purple-500/20 text-purple-300'
                                        : 'text-gray-300 hover:bg-white/5 hover:text-white'
                                        }`}
                                >
                                    <span className={`inline-block px-2 py-1 rounded border ${getStatusStyles(s)
                                        }`}>
                                        {s}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </>
                )}
            </>
        )
    }

    const handleAddCustomColumn = () => {
        if (!newColumnName.trim()) return
        const newColumn = {
            id: Date.now().toString(),
            name: newColumnName.trim()
        }
        setCustomColumns([...customColumns, newColumn])
        setNewColumnName('')
    }

    const handleRenameColumn = (id: string, newName: string) => {
        setCustomColumns(customColumns.map(col =>
            col.id === id ? { ...col, name: newName } : col
        ))
    }

    const handleDeleteColumn = (id: string) => {
        setCustomColumns(customColumns.filter(col => col.id !== id))
    }

    const handleReorderColumn = (draggedId: string, targetId: string) => {
        const draggedIndex = customColumns.findIndex(col => col.id === draggedId)
        const targetIndex = customColumns.findIndex(col => col.id === targetId)

        if (draggedIndex === -1 || targetIndex === -1) return

        const newColumns = [...customColumns]
        const [removed] = newColumns.splice(draggedIndex, 1)
        newColumns.splice(targetIndex, 0, removed)

        setCustomColumns(newColumns)
    }

    const handleSaveColumns = async () => {
        // TODO: Save custom columns to Supabase user preferences/settings
        // This would store the column configuration so it persists across sessions
        console.log('Saving columns:', customColumns)
        setShowCustomizeModal(false)
    }

    const handleSaveNew = async () => {
        if (!newRow.company || !newRow.role) {
            setShowError(true)
            setTimeout(() => setShowError(false), 3000)
            return
        }

        const result = await createApplication({
            company: newRow.company,
            role: newRow.role,
            status: newRow.status,
            applied_at: newRow.applied_at,
            notes: newRow.notes,
            custom_fields: newRow.custom_fields,
        })

        if (result.error) {
            console.error('Failed to save application:', result.error)
            return
        }

        // Reload applications from database
        await loadApplications()

        // Reset new row
        setNewRow({
            company: '',
            role: '',
            status: 'Applied',
            applied_at: new Date().toISOString().split('T')[0],
            notes: '',
            custom_fields: {},
        })
        setShowNewRow(false)
    }

    const handleDelete = async (id: string) => {
        if (!id) return

        const result = await deleteApplication(id)

        if (result.error) {
            console.error('Failed to delete application:', result.error)
            return
        }

        // Reload applications from database
        await loadApplications()
    }

    const handleSaveNotes = async () => {
        if (!expandedNotes) return

        const result = await updateApplication(expandedNotes.id, {
            notes: editedNotes
        })

        if (result.error) {
            console.error('Failed to update notes:', result.error)
            return
        }

        // Reload applications from database
        await loadApplications()

        setIsEditingNotes(false)
        setExpandedNotes(null)
    }

    return (
        <div className="space-y-6">
            {/* Notes Modal */}
            {expandedNotes && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    {/* Dark Overlay */}
                    <div
                        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                        onClick={() => setExpandedNotes(null)}
                    ></div>

                    {/* Modal Content */}
                    <div className="relative w-full max-w-2xl mx-4 rounded-2xl border-2 border-purple-500/30 bg-gradient-to-b from-purple-500/10 to-black p-6 shadow-2xl">
                        {/* Close Button */}
                        <button
                            onClick={() => setExpandedNotes(null)}
                            className="absolute top-4 right-4 w-8 h-8 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 flex items-center justify-center transition-colors"
                        >
                            <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>

                        {/* Notes Content */}
                        <div className="pr-8">
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="text-lg font-semibold text-purple-400">Notes</h3>
                                {!isEditingNotes && (
                                    <button
                                        onClick={() => {
                                            setIsEditingNotes(true)
                                            setEditedNotes(expandedNotes.notes)
                                        }}
                                        className="text-sm text-purple-400 hover:text-purple-300 flex items-center gap-1 transition-colors"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                        </svg>
                                        Edit
                                    </button>
                                )}
                            </div>
                            <p className="text-xs text-gray-500 mb-4">{expandedNotes.company} • {expandedNotes.role}</p>

                            {isEditingNotes ? (
                                <div className="space-y-4">
                                    <textarea
                                        value={editedNotes}
                                        onChange={(e) => setEditedNotes(e.target.value)}
                                        className="w-full min-h-[200px] px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-gray-300 placeholder-gray-500 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 resize-none"
                                        placeholder="Enter your notes..."
                                    />
                                    <div className="flex gap-3 justify-end">
                                        <button
                                            onClick={() => {
                                                setIsEditingNotes(false)
                                                setEditedNotes('')
                                            }}
                                            className="px-4 py-2 border border-white/10 hover:border-white/20 text-gray-300 hover:text-white rounded-lg transition-colors"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={handleSaveNotes}
                                            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
                                        >
                                            Save
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <p className="text-gray-300 whitespace-pre-wrap break-words leading-relaxed">{expandedNotes.notes}</p>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Customize Modal */}
            {showCustomizeModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center pt-12">
                    {/* Dark Overlay */}
                    <div
                        className="absolute inset-0 bg-black/90 backdrop-blur-md"
                        onClick={() => setShowCustomizeModal(false)}
                    ></div>

                    {/* Modal Content */}
                    <div className="relative w-full max-w-3xl mx-4 rounded-2xl border-2 border-purple-500/30 shadow-2xl bg-gradient-to-b from-purple-500/10 to-black p-2">
                        <div
                            className="max-h-[80vh] overflow-y-scroll rounded-xl"
                            style={{
                                paddingTop: '24px',
                                paddingBottom: '24px',
                                paddingLeft: '28px',
                                paddingRight: '20px'
                            }}
                            onScroll={(e) => {
                                setIsScrolling(true)
                                if (scrollTimeoutRef.current) {
                                    clearTimeout(scrollTimeoutRef.current)
                                }
                                scrollTimeoutRef.current = setTimeout(() => {
                                    setIsScrolling(false)
                                }, 800)
                            }}
                        >
                            <style jsx>{`
                                @keyframes fadeOut {
                                    0% {
                                        opacity: 1;
                                    }
                                    100% {
                                        opacity: 0;
                                    }
                                }
                                div::-webkit-scrollbar {
                                    width: 5px;
                                }
                                div::-webkit-scrollbar-track {
                                    background: transparent;
                                }
                                div::-webkit-scrollbar-thumb {
                                    background: rgba(168, 85, 247, 0.4);
                                    border-radius: 10px;
                                    opacity: ${isScrolling ? '1' : '0'};
                                    transition: opacity 1.2s ease-out;
                                }
                            `}</style>
                            <div className="pb-8">
                                {/* Header */}
                                <div className="flex items-center justify-between mb-6">
                                    <div>
                                        <h3 className="text-2xl font-bold text-white">Customize Columns</h3>
                                        <p className="text-sm text-gray-400 mt-1">Manage your table layout</p>
                                    </div>
                                    <button
                                        onClick={() => setShowCustomizeModal(false)}
                                        className="w-8 h-8 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 flex items-center justify-center transition-colors"
                                    >
                                        <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>

                                {/* Core Columns Section */}
                                <div className="mb-8">
                                    <h4 className="text-sm font-semibold text-purple-400 mb-3 flex items-center gap-2">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                        </svg>
                                        Core Columns (Fixed)
                                    </h4>
                                    <div className="space-y-2">
                                        {['Company', 'Position', 'Status', 'Date Applied', 'Notes'].map((col, idx) => (
                                            <div key={idx} className="flex items-center gap-3 px-4 py-3 bg-white/5 rounded-lg border border-white/10">
                                                <div className="w-6 h-6 rounded bg-purple-500/20 flex items-center justify-center">
                                                    <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                    </svg>
                                                </div>
                                                <span className="text-gray-300 flex-1">{col}</span>
                                                <span className="text-xs text-gray-500 bg-gray-500/10 px-2 py-1 rounded">Required</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Custom Columns Section */}
                                <div className="mb-6">
                                    <h4 className="text-sm font-semibold text-purple-400 mb-3 flex items-center gap-2">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                                        </svg>
                                        Custom Columns
                                    </h4>

                                    {/* Custom Columns List */}
                                    <div className="space-y-2 mb-4">
                                        {customColumns.length === 0 ? (
                                            <div className="text-center py-8 text-gray-500 border border-dashed border-white/10 rounded-lg">
                                                <p className="text-sm">No custom columns yet</p>
                                                <p className="text-xs mt-1">Add one below to get started</p>
                                            </div>
                                        ) : (
                                            customColumns.map((col, index) => (
                                                <div
                                                    key={col.id}
                                                    draggable
                                                    onDragStart={() => setDraggedColumn(col.id)}
                                                    onDragEnd={() => setDraggedColumn(null)}
                                                    onDragOver={(e) => {
                                                        e.preventDefault()
                                                        if (draggedColumn && draggedColumn !== col.id) {
                                                            handleReorderColumn(draggedColumn, col.id)
                                                        }
                                                    }}
                                                    className={`flex items-center gap-3 px-4 py-3 bg-purple-500/5 rounded-lg border border-purple-500/20 group hover:border-purple-500/40 transition-colors cursor-move ${draggedColumn === col.id ? 'opacity-50' : ''
                                                        }`}
                                                >
                                                    <button
                                                        className="cursor-grab active:cursor-grabbing text-gray-500 hover:text-purple-400 transition-colors"
                                                        onMouseDown={(e) => e.stopPropagation()}
                                                    >
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
                                                        </svg>
                                                    </button>
                                                    <div className="w-6 h-6 rounded bg-purple-500/20 flex items-center justify-center">
                                                        <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                                        </svg>
                                                    </div>
                                                    <input
                                                        type="text"
                                                        value={col.name}
                                                        onChange={(e) => handleRenameColumn(col.id, e.target.value)}
                                                        className="flex-1 bg-transparent border-none outline-none text-gray-300 focus:text-white"
                                                        placeholder="Column name"
                                                    />
                                                    <button
                                                        onClick={() => handleDeleteColumn(col.id)}
                                                        className="opacity-0 group-hover:opacity-100 transition-opacity text-red-400 hover:text-red-300"
                                                        title="Delete column"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                        </svg>
                                                    </button>
                                                </div>
                                            ))
                                        )}
                                    </div>

                                    {/* Add New Column Input */}
                                    <div className="flex gap-3">
                                        <input
                                            type="text"
                                            value={newColumnName}
                                            onChange={(e) => setNewColumnName(e.target.value)}
                                            onKeyPress={(e) => e.key === 'Enter' && handleAddCustomColumn()}
                                            placeholder="New column name"
                                            className="flex-1 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                                        />
                                        <button
                                            onClick={handleAddCustomColumn}
                                            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors font-medium flex items-center gap-2"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                            </svg>
                                            Add
                                        </button>
                                    </div>
                                </div>

                                {/* Footer Actions */}
                                <div className="flex items-center justify-end gap-3 pt-6 border-t border-white/10">
                                    <button
                                        onClick={() => setShowCustomizeModal(false)}
                                        className="px-6 py-2 border border-white/10 hover:border-white/20 text-gray-300 hover:text-white rounded-lg transition-colors font-medium"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleSaveColumns}
                                        className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-all hover:scale-[1.02] font-medium"
                                    >
                                        Done
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Error Toast */}
            {showError && (
                <div className="fixed top-8 right-8 z-50 rounded-lg border border-purple-500/20 bg-gradient-to-b from-purple-500/10 to-transparent backdrop-blur-lg p-4 shadow-lg animate-in slide-in-from-top">
                    <div className="flex items-center gap-3">
                        <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <p className="text-sm text-gray-300">Please fill in Company and Position fields</p>
                    </div>
                </div>
            )}

            {/* Save Status Indicator */}
            {saveStatus !== 'idle' && (
                <div className="fixed bottom-8 right-8 z-50 rounded-lg border border-purple-500/20 bg-gradient-to-b from-purple-500/10 to-black backdrop-blur-lg px-4 py-2 shadow-lg">
                    <div className="flex items-center gap-2 text-sm">
                        {saveStatus === 'saving' ? (
                            <>
                                <svg className="w-4 h-4 animate-spin text-purple-400" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                <span className="text-gray-300">Saving...</span>
                            </>
                        ) : (
                            <>
                                <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                <span className="text-green-400">Saved</span>
                            </>
                        )}
                    </div>
                </div>
            )}

            <div className="flex items-center justify-between">
                <div className="flex items-center gap-6">
                    <button
                        onClick={() => setActiveTab('applications')}
                        className={`text-xl font-semibold transition-colors ${activeTab === 'applications'
                            ? 'text-white border-b-2 border-purple-500 pb-1'
                            : 'text-gray-500 hover:text-gray-300'
                            }`}
                    >
                        Applications
                    </button>
                    <button
                        onClick={() => setActiveTab('stats')}
                        className={`text-xl font-semibold transition-colors ${activeTab === 'stats'
                            ? 'text-white border-b-2 border-purple-500 pb-1'
                            : 'text-gray-500 hover:text-gray-300'
                            }`}
                    >
                        Stats
                    </button>
                </div>
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => setShowCustomizeModal(true)}
                        className="px-4 py-2 text-sm border border-white/10 hover:border-purple-500/50 text-gray-300 hover:text-white rounded-lg transition-colors font-medium"
                    >
                        Customize
                    </button>
                    <button
                        onClick={() => setShowNewRow(true)}
                        className="px-4 py-2 text-sm bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors font-medium"
                    >
                        Insert Entry
                    </button>
                    <span className="text-sm text-gray-400">{apps.length} applications</span>
                </div>
            </div>

            {activeTab === 'applications' ? (

                <div className="rounded-lg border border-white/10 bg-gradient-to-b from-white/5 to-transparent overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full table-fixed">
                            <thead className="bg-white/5 border-b border-white/10">
                                <tr>
                                    {table.getHeaderGroups().map((headerGroup) =>
                                        headerGroup.headers.map((header, idx, arr) => (
                                            <th
                                                key={header.id}
                                                className="px-4 py-3 text-left text-sm font-medium text-gray-300"
                                                style={{
                                                    width: header.id === 'company' ? '200px' :
                                                        header.id === 'role' ? '200px' :
                                                            header.id === 'status' ? '150px' :
                                                                header.id === 'applied_at' ? '140px' :
                                                                    header.id === 'notes' ? '200px' : '200px'
                                                }}
                                            >
                                                {flexRender(
                                                    header.column.columnDef.header,
                                                    header.getContext()
                                                )}
                                            </th>
                                        ))
                                    )}
                                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-300 w-24 relative">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {/* Existing Rows */}
                                {apps.length === 0 && !showNewRow && (
                                    <tr>
                                        <td colSpan={table.getAllLeafColumns().length + 1} className="text-center py-12 text-gray-500">
                                            <p>No applications yet. Start by adding one above!</p>
                                        </td>
                                    </tr>
                                )}
                                {table.getRowModel().rows.map((row) => (
                                    <tr
                                        key={row.id}
                                        className="border-b border-white/5 hover:bg-white/5 focus-within:border-purple-500/50 focus-within:border-2 transition-all"
                                    >
                                        {row.getVisibleCells().map((cell, idx, arr) => {
                                            const isNotesColumn = cell.column.id === 'notes'
                                            const noteValue = isNotesColumn ? row.original.notes : null
                                            const columnId = cell.column.id
                                            const isCustomColumn = !['company', 'role', 'status', 'applied_at', 'notes'].includes(columnId)
                                            const currentValue = editingData[row.original.id!]?.[columnId as keyof Application] ??
                                                (isCustomColumn ? row.original.custom_fields?.[columnId] : row.original[columnId as keyof Application])

                                            // Notes column - click to expand
                                            if (isNotesColumn) {
                                                return (
                                                    <td
                                                        key={cell.id}
                                                        className="px-4 py-3 text-sm text-gray-300 truncate cursor-pointer hover:text-purple-400"
                                                        onClick={() => {
                                                            if (noteValue && row.original.id) {
                                                                setExpandedNotes({
                                                                    id: row.original.id,
                                                                    company: row.original.company,
                                                                    role: row.original.role,
                                                                    notes: noteValue
                                                                })
                                                                setIsEditingNotes(false)
                                                                setEditedNotes('')
                                                            }
                                                        }}
                                                    >
                                                        {noteValue}
                                                    </td>
                                                )
                                            }

                                            // Editable cells
                                            return (
                                                <td key={cell.id} className={`px-4 py-3 ${columnId === 'applied_at' ? '' : 'w-48'}`}
                                                >
                                                    {columnId === 'status' ? (
                                                        <StatusBadge
                                                            status={currentValue as string}
                                                            rowId={row.original.id!}
                                                            onChange={(value) => handleCellEdit(row.original.id!, 'status', value)}
                                                        />
                                                    ) : columnId === 'applied_at' ? (
                                                        <input
                                                            type="date"
                                                            value={currentValue as string}
                                                            onChange={(e) => handleCellEdit(row.original.id!, 'applied_at', e.target.value)}
                                                            className="w-full bg-transparent border-none outline-none text-sm text-gray-300 focus:text-white"
                                                        />
                                                    ) : isCustomColumn ? (
                                                        <input
                                                            type="text"
                                                            value={currentValue as string || ''}
                                                            onChange={(e) => handleCustomFieldEdit(row.original.id!, columnId, e.target.value)}
                                                            className="w-full bg-transparent border-none outline-none text-sm text-gray-300 focus:text-white truncate"
                                                        />
                                                    ) : (
                                                        <input
                                                            type="text"
                                                            value={currentValue as string}
                                                            onChange={(e) => handleCellEdit(row.original.id!, columnId as keyof Application, e.target.value)}
                                                            className="w-full bg-transparent border-none outline-none text-sm text-gray-300 focus:text-white truncate"
                                                        />
                                                    )}
                                                    {idx < arr.length - 1 && (
                                                        <span className="absolute right-0 top-1/2 -translate-y-1/2 text-gray-700/40 select-none pointer-events-none">|</span>
                                                    )}
                                                </td>
                                            )
                                        })}
                                        <td className="px-4 py-3">
                                            <button
                                                onClick={() => handleDelete(row.original.id!)}
                                                className="text-red-400 hover:text-red-300 transition-colors"
                                                title="Delete"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                            </button>
                                        </td>
                                    </tr>
                                ))}

                                {/* New Row */}
                                {showNewRow && (
                                    <tr className="border-b border-white/5 bg-purple-500/5 focus-within:border-purple-500 focus-within:border-2 transition-all relative">
                                        <td className="px-4 py-3 relative">
                                            <input
                                                type="text"
                                                value={newRow.company}
                                                onChange={(e) =>
                                                    setNewRow({ ...newRow, company: e.target.value })
                                                }
                                                placeholder="Company name"
                                                className="w-full bg-transparent border-none outline-none text-sm text-white placeholder-gray-500"
                                            />
                                        </td>
                                        <td className="px-4 py-3 relative">
                                            <input
                                                type="text"
                                                value={newRow.role}
                                                onChange={(e) =>
                                                    setNewRow({ ...newRow, role: e.target.value })
                                                }
                                                placeholder="Position"
                                                className="w-full bg-transparent border-none outline-none text-sm text-white placeholder-gray-500"
                                            />
                                        </td>
                                        <td className="px-4 py-3 relative">
                                            <StatusBadge
                                                status={newRow.status}
                                                rowId="new-row"
                                                onChange={(value) => setNewRow({ ...newRow, status: value })}
                                            />
                                        </td>
                                        <td className="px-4 py-3 relative">
                                            <input
                                                type="date"
                                                value={newRow.applied_at}
                                                onChange={(e) =>
                                                    setNewRow({ ...newRow, applied_at: e.target.value })
                                                }
                                                className="w-full bg-transparent border-none outline-none text-sm text-white"
                                            />
                                        </td>
                                        <td className="px-4 py-3 relative">
                                            <input
                                                type="text"
                                                value={newRow.notes}
                                                onChange={(e) =>
                                                    setNewRow({ ...newRow, notes: e.target.value })
                                                }
                                                placeholder="Notes"
                                                className="w-full bg-transparent border-none outline-none text-sm text-white placeholder-gray-500 truncate"
                                            />
                                        </td>
                                        {/* Custom Column Inputs */}
                                        {customColumns.map((col, idx, arr) => (
                                            <td key={col.id} className="px-4 py-3">
                                                <input
                                                    type="text"
                                                    value={newRow.custom_fields?.[col.id] || ''}
                                                    onChange={(e) =>
                                                        setNewRow({
                                                            ...newRow,
                                                            custom_fields: {
                                                                ...newRow.custom_fields,
                                                                [col.id]: e.target.value
                                                            }
                                                        })
                                                    }
                                                    placeholder={col.name}
                                                    className="w-full bg-transparent border-none outline-none text-sm text-white placeholder-gray-500 truncate"
                                                />
                                            </td>
                                        ))}
                                        <td className="px-4 py-3 flex gap-2 items-center relative">
                                            <button
                                                onClick={handleSaveNew}
                                                className="text-xs bg-purple-600 hover:bg-purple-700 px-3 py-1 rounded transition-colors"
                                            >
                                                Save
                                            </button>
                                            <button
                                                onClick={() => setShowNewRow(false)}
                                                className="text-gray-400 hover:text-red-400 p-1 rounded transition-colors"
                                                title="Discard draft entry"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                </svg>
                                            </button>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : (
                <div className="rounded-lg border border-white/10 bg-gradient-to-b from-white/5 to-transparent p-8">
                    <h3 className="text-2xl font-bold text-white mb-6">Application Statistics</h3>

                    <div className="max-w-4xl mx-auto">
                        {/* Calculate status counts */}
                        {(() => {
                            const statusCounts = apps.reduce((acc, app) => {
                                acc[app.status] = (acc[app.status] || 0) + 1
                                return acc
                            }, {} as Record<string, number>)

                            const applied = statusCounts['Applied'] || 0
                            const interview = statusCounts['Interview'] || 0
                            const offer = statusCounts['Offer'] || 0
                            const rejected = statusCounts['Rejected'] || 0
                            const total = apps.length

                            // Calculate percentages and arc lengths (circumference = 2πr = 502.65)
                            const circumference = 2 * Math.PI * 80
                            const appliedArc = total > 0 ? (applied / total) * circumference : 0
                            const interviewArc = total > 0 ? (interview / total) * circumference : 0
                            const offerArc = total > 0 ? (offer / total) * circumference : 0
                            const rejectedArc = total > 0 ? (rejected / total) * circumference : 0

                            return (
                                <>
                                    {/* Pie Chart */}
                                    <div className="flex items-center justify-center">
                                        <div className="relative w-80 h-80">
                                            {total > 0 ? (
                                                <>
                                                    <svg viewBox="0 0 200 200" className="w-full h-full">
                                                        {/* Applied - Gray */}
                                                        {applied > 0 && (
                                                            <circle
                                                                cx="100"
                                                                cy="100"
                                                                r="80"
                                                                fill="none"
                                                                stroke="rgb(107, 114, 128)"
                                                                strokeWidth="40"
                                                                strokeDasharray={`${appliedArc} ${circumference}`}
                                                                transform="rotate(-90 100 100)"
                                                                className="cursor-pointer transition-all"
                                                                style={{ opacity: hoveredStatus && hoveredStatus !== 'Applied' ? 0.3 : 1 }}
                                                                onMouseEnter={() => setHoveredStatus('Applied')}
                                                                onMouseLeave={() => setHoveredStatus(null)}
                                                            />
                                                        )}
                                                        {/* Interview - Purple */}
                                                        {interview > 0 && (
                                                            <circle
                                                                cx="100"
                                                                cy="100"
                                                                r="80"
                                                                fill="none"
                                                                stroke="rgb(168, 85, 247)"
                                                                strokeWidth="40"
                                                                strokeDasharray={`${interviewArc} ${circumference}`}
                                                                strokeDashoffset={-appliedArc}
                                                                transform="rotate(-90 100 100)"
                                                                className="cursor-pointer transition-all"
                                                                style={{ opacity: hoveredStatus && hoveredStatus !== 'Interview' ? 0.3 : 1 }}
                                                                onMouseEnter={() => setHoveredStatus('Interview')}
                                                                onMouseLeave={() => setHoveredStatus(null)}
                                                            />
                                                        )}
                                                        {/* Offer - Green */}
                                                        {offer > 0 && (
                                                            <circle
                                                                cx="100"
                                                                cy="100"
                                                                r="80"
                                                                fill="none"
                                                                stroke="rgb(34, 197, 94)"
                                                                strokeWidth="40"
                                                                strokeDasharray={`${offerArc} ${circumference}`}
                                                                strokeDashoffset={-(appliedArc + interviewArc)}
                                                                transform="rotate(-90 100 100)"
                                                                className="cursor-pointer transition-all"
                                                                style={{ opacity: hoveredStatus && hoveredStatus !== 'Offer' ? 0.3 : 1 }}
                                                                onMouseEnter={() => setHoveredStatus('Offer')}
                                                                onMouseLeave={() => setHoveredStatus(null)}
                                                            />
                                                        )}
                                                        {/* Rejected - Pink */}
                                                        {rejected > 0 && (
                                                            <circle
                                                                cx="100"
                                                                cy="100"
                                                                r="80"
                                                                fill="none"
                                                                stroke="rgb(244, 114, 182)"
                                                                strokeWidth="40"
                                                                strokeDasharray={`${rejectedArc} ${circumference}`}
                                                                strokeDashoffset={-(appliedArc + interviewArc + offerArc)}
                                                                transform="rotate(-90 100 100)"
                                                                className="cursor-pointer transition-all"
                                                                style={{ opacity: hoveredStatus && hoveredStatus !== 'Rejected' ? 0.3 : 1 }}
                                                                onMouseEnter={() => setHoveredStatus('Rejected')}
                                                                onMouseLeave={() => setHoveredStatus(null)}
                                                            />
                                                        )}
                                                    </svg>
                                                    <div className="absolute inset-0 flex items-center justify-center">
                                                        <div className="text-center">
                                                            <p className="text-4xl font-bold text-white">{total}</p>
                                                            <p className="text-sm text-gray-400">Total</p>
                                                        </div>
                                                    </div>
                                                </>
                                            ) : (
                                                <div className="flex items-center justify-center h-full">
                                                    <p className="text-gray-500">No applications yet</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Legend */}
                                    <div className="mt-8 grid grid-cols-2 gap-4 max-w-md mx-auto">
                                        <div
                                            className={`flex items-center justify-between gap-3 p-2 rounded-lg cursor-pointer transition-all ${hoveredStatus === 'Applied' ? 'bg-white/10' : 'hover:bg-white/5'
                                                }`}
                                            onMouseEnter={() => setHoveredStatus('Applied')}
                                            onMouseLeave={() => setHoveredStatus(null)}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="w-4 h-4 rounded bg-gray-500"></div>
                                                <span className="text-sm text-gray-300">Applied</span>
                                            </div>
                                            <span className="text-sm font-semibold text-white">{applied}</span>
                                        </div>
                                        <div
                                            className={`flex items-center justify-between gap-3 p-2 rounded-lg cursor-pointer transition-all ${hoveredStatus === 'Interview' ? 'bg-white/10' : 'hover:bg-white/5'
                                                }`}
                                            onMouseEnter={() => setHoveredStatus('Interview')}
                                            onMouseLeave={() => setHoveredStatus(null)}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="w-4 h-4 rounded bg-purple-500"></div>
                                                <span className="text-sm text-gray-300">Interview</span>
                                            </div>
                                            <span className="text-sm font-semibold text-white">{interview}</span>
                                        </div>
                                        <div
                                            className={`flex items-center justify-between gap-3 p-2 rounded-lg cursor-pointer transition-all ${hoveredStatus === 'Offer' ? 'bg-white/10' : 'hover:bg-white/5'
                                                }`}
                                            onMouseEnter={() => setHoveredStatus('Offer')}
                                            onMouseLeave={() => setHoveredStatus(null)}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="w-4 h-4 rounded bg-green-500"></div>
                                                <span className="text-sm text-gray-300">Offer</span>
                                            </div>
                                            <span className="text-sm font-semibold text-white">{offer}</span>
                                        </div>
                                        <div
                                            className={`flex items-center justify-between gap-3 p-2 rounded-lg cursor-pointer transition-all ${hoveredStatus === 'Rejected' ? 'bg-white/10' : 'hover:bg-white/5'
                                                }`}
                                            onMouseEnter={() => setHoveredStatus('Rejected')}
                                            onMouseLeave={() => setHoveredStatus(null)}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="w-4 h-4 rounded bg-pink-400"></div>
                                                <span className="text-sm text-gray-300">Rejected</span>
                                            </div>
                                            <span className="text-sm font-semibold text-white">{rejected}</span>
                                        </div>
                                    </div>
                                </>
                            )
                        })()}
                    </div>
                </div>
            )
            }
        </div >
    )
}

export { easterEggs }