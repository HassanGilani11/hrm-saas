export function exportToCSV(data: any[], filename: string) {
    if (!data || data.length === 0) {
        return
    }

    // Get headers from first object keys
    // We'll flatten the object for better CSV structure
    const flattenObject = (obj: any, prefix = ''): any => {
        return Object.keys(obj).reduce((acc: any, k: string) => {
            const pre = prefix.length ? prefix + '.' : ''
            if (
                typeof obj[k] === 'object' &&
                obj[k] !== null &&
                !Array.isArray(obj[k]) &&
                !(obj[k] instanceof Date)
            ) {
                Object.assign(acc, flattenObject(obj[k], pre + k))
            } else {
                acc[pre + k] = obj[k]
            }
            return acc
        }, {})
    }

    const flatData = data.map(item => flattenObject(item))
    const headers = Object.keys(flatData[0])

    const csvContent = [
        headers.join(','), // Header row
        ...flatData.map(row =>
            headers.map(fieldName => {
                const value = row[fieldName]
                // Handle strings that might contain commas or newlines
                if (typeof value === 'string') {
                    return `"${value.replace(/"/g, '""')}"`
                }
                return value
            }).join(',')
        )
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')

    if (link.download !== undefined) {
        const url = URL.createObjectURL(blob)
        link.setAttribute('href', url)
        link.setAttribute('download', `${filename}.csv`)
        link.style.visibility = 'hidden'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
    }
}
