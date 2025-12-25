import * as React from "react"
import { router, usePage } from "@inertiajs/react"
import { Search, Calendar, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"

interface DataTableProps<T> {
    data: T[]
    columns: ColumnDef<T>[]
    searchPlaceholder?: string
    searchKey?: string
    dateFilterKey?: string
    dateFilterLabel?: string
    emptyMessage?: string
    baseUrl?: string
}

interface ColumnDef<T> {
    header: string
    accessorKey: keyof T | string
    cell?: (row: T) => React.ReactNode
}

export function DataTable<T extends Record<string, any>>({
    data,
    columns,
    searchPlaceholder = "Search...",
    searchKey = "search",
    dateFilterKey = "date",
    dateFilterLabel = "Date",
    emptyMessage = "No data found",
    baseUrl,
}: DataTableProps<T>) {
    const page = usePage()
    const url = baseUrl || page.url.split("?")[0]
    
    // Get current query params from URL (only on mount)
    const initialParams = React.useMemo(() => {
        const searchParams = new URLSearchParams(window.location.search)
        return {
            search: searchParams.get(searchKey) || "",
            startDate: searchParams.get(`${dateFilterKey}_start`) || "",
            endDate: searchParams.get(`${dateFilterKey}_end`) || "",
        }
    }, []) // Only compute once on mount

    const [searchQuery, setSearchQuery] = React.useState(initialParams.search)
    const [startDate, setStartDate] = React.useState(() => {
        if (initialParams.startDate) {
            const [date] = initialParams.startDate.split("T")
            return date || ""
        }
        return ""
    })
    const [startTime, setStartTime] = React.useState(() => {
        if (initialParams.startDate) {
            const [, time] = initialParams.startDate.split("T")
            return time ? time.substring(0, 5) : ""
        }
        return ""
    })
    const [endDate, setEndDate] = React.useState(() => {
        if (initialParams.endDate) {
            const [date] = initialParams.endDate.split("T")
            return date || ""
        }
        return ""
    })
    const [endTime, setEndTime] = React.useState(() => {
        if (initialParams.endDate) {
            const [, time] = initialParams.endDate.split("T")
            return time ? time.substring(0, 5) : ""
        }
        return ""
    })

    const updateFilters = React.useCallback(() => {
        const params: Record<string, any> = {}
        
        if (searchQuery) {
            params[searchKey] = searchQuery
        }
        
        if (startDate) {
            const startDateTime = startTime ? `${startDate}T${startTime}:00` : `${startDate}T00:00:00`
            params[`${dateFilterKey}_start`] = startDateTime
        }
        
        if (endDate) {
            const endDateTime = endTime ? `${endDate}T${endTime}:59` : `${endDate}T23:59:59`
            params[`${dateFilterKey}_end`] = endDateTime
        }

        router.get(url, params, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        })
    }, [searchQuery, startDate, startTime, endDate, endTime, url, searchKey, dateFilterKey])

    // Debounce search
    React.useEffect(() => {
        const timer = setTimeout(() => {
            updateFilters()
        }, 500)

        return () => clearTimeout(timer)
    }, [searchQuery])

    const handleDateChange = () => {
        updateFilters()
    }

    const clearFilters = () => {
        setSearchQuery("")
        setStartDate("")
        setStartTime("")
        setEndDate("")
        setEndTime("")
        router.get(url, {}, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        })
    }

    const hasActiveFilters = searchQuery || startDate || endDate

    return (
        <div className="space-y-4">
            {/* Filters */}
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="flex flex-1 items-center gap-2">
                    <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            type="text"
                            placeholder={searchPlaceholder}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-8"
                        />
                    </div>
                </div>
                
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                    <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground whitespace-nowrap">{dateFilterLabel} From:</span>
                        <Input
                            type="date"
                            value={startDate}
                            onChange={(e) => {
                                setStartDate(e.target.value)
                                if (e.target.value) {
                                    setTimeout(() => handleDateChange(), 100)
                                }
                            }}
                            className="w-auto"
                        />
                        <Input
                            type="time"
                            value={startTime}
                            onChange={(e) => {
                                setStartTime(e.target.value)
                                if (startDate) {
                                    setTimeout(() => handleDateChange(), 100)
                                }
                            }}
                            className="w-auto"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground whitespace-nowrap">To:</span>
                        <Input
                            type="date"
                            value={endDate}
                            onChange={(e) => {
                                setEndDate(e.target.value)
                                if (e.target.value) {
                                    setTimeout(() => handleDateChange(), 100)
                                }
                            }}
                            className="w-auto"
                        />
                        <Input
                            type="time"
                            value={endTime}
                            onChange={(e) => {
                                setEndTime(e.target.value)
                                if (endDate) {
                                    setTimeout(() => handleDateChange(), 100)
                                }
                            }}
                            className="w-auto"
                        />
                    </div>
                    {hasActiveFilters && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={clearFilters}
                            className="whitespace-nowrap"
                        >
                            <X className="mr-2 h-4 w-4" />
                            Clear
                        </Button>
                    )}
                </div>
            </div>

            {/* Table */}
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            {columns.map((column, index) => (
                                <TableHead key={index}>{column.header}</TableHead>
                            ))}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {data.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={columns.length} className="h-24 text-center">
                                    {emptyMessage}
                                </TableCell>
                            </TableRow>
                        ) : (
                            data.map((row, rowIndex) => (
                                <TableRow key={rowIndex}>
                                    {columns.map((column, colIndex) => (
                                        <TableCell key={colIndex}>
                                            {column.cell
                                                ? column.cell(row)
                                                : String(row[column.accessorKey as keyof T] ?? "")}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}

