'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { ChevronDown, ChevronRight, LayoutDashboard, Settings, Users, Clock, Calendar, DollarSign } from 'lucide-react'
import { useState, useEffect } from 'react'

const iconMap: Record<string, any> = {
    LayoutDashboard,
    Settings,
    Users,
    Clock,
    Calendar,
    DollarSign,
}

interface NavItem {
    href: string
    label: string
    icon: string
    subItems?: { href: string; label: string }[]
}

export function SidebarNav({ items }: { items: NavItem[] }) {
    const pathname = usePathname()
    const [expandedItems, setExpandedItems] = useState<string[]>([])

    // Automatically expand parent if a sub-item is active
    useEffect(() => {
        const activeParents = items
            .filter(item =>
                item.href !== '#' && (
                    pathname === item.href ||
                    item.subItems?.some(sub => pathname === sub.href)
                )
            )
            .map(item => item.href)

        if (activeParents.length > 0) {
            setExpandedItems(activeParents)
        } else {
            setExpandedItems([])
        }
    }, [pathname, items])

    const toggleExpand = (e: React.MouseEvent, href: string) => {
        e.preventDefault()
        e.stopPropagation()
        setExpandedItems(prev =>
            prev.includes(href)
                ? prev.filter(i => i !== href)
                : [...prev, href]
        )
    }

    return (
        <nav className="flex-1 space-y-1 p-4">
            {items.map((item) => {
                const Icon = iconMap[item.icon] || LayoutDashboard
                const isActive = pathname === item.href || item.subItems?.some(sub => pathname === sub.href)
                const isExpanded = expandedItems.includes(item.href)

                return (
                    <div key={item.href} className="space-y-1">
                        <Link
                            href={item.href}
                            className={cn(
                                "flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition-all hover:bg-muted hover:text-primary",
                                isActive ? "bg-primary/10 text-primary" : "text-muted-foreground"
                            )}
                        >
                            <div className="flex items-center gap-3">
                                <Icon className="h-4 w-4" />
                                {item.label}
                            </div>
                            {item.subItems && (
                                <div onClick={(e) => toggleExpand(e, item.href)}>
                                    {isExpanded ? (
                                        <ChevronDown className="h-4 w-4 opacity-50" />
                                    ) : (
                                        <ChevronRight className="h-4 w-4 opacity-50" />
                                    )}
                                </div>
                            )}
                        </Link>

                        {item.subItems && isExpanded && (
                            <div className="ml-9 space-y-1 border-l pl-2">
                                {item.subItems.map((sub) => (
                                    <Link
                                        key={sub.href}
                                        href={sub.href}
                                        className={cn(
                                            "block rounded-md px-3 py-1 text-xs font-medium transition-all hover:bg-muted hover:text-primary",
                                            pathname === sub.href ? "text-primary font-bold bg-primary/5" : "text-muted-foreground"
                                        )}
                                    >
                                        {sub.label}
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>
                )
            })}
        </nav>
    )
}
