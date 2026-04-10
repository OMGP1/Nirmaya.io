/**
 * ResponsiveTable Component
 * 
 * Responsive table that switches between table view (desktop) and card view (mobile).
 * Automatically renders data as cards on mobile devices.
 */
import { cn } from '@/lib/utils';

const ResponsiveTable = ({
    data = [],
    columns = [],
    renderMobileCard,
    emptyMessage = 'No data available',
    className
}) => {
    if (!data || data.length === 0) {
        return (
            <div className="text-center py-12 text-gray-500">
                {emptyMessage}
            </div>
        );
    }

    return (
        <>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto rounded-lg border border-gray-200">
                <table className={cn('w-full text-sm text-left', className)}>
                    <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
                        <tr>
                            {columns.map((column, index) => (
                                <th
                                    key={index}
                                    className="px-6 py- font-semibold tracking-wider"
                                >
                                    {column.header}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                        {data.map((row, rowIndex) => (
                            <tr
                                key={rowIndex}
                                className="hover:bg-gray-50 transition-colors"
                            >
                                {columns.map((column, colIndex) => (
                                    <td
                                        key={colIndex}
                                        className="px-6 py-4 whitespace-nowrap"
                                    >
                                        {column.render
                                            ? column.render(row, rowIndex)
                                            : row[column.accessor]
                                        }
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden space-y-4">
                {data.map((item, index) => (
                    <div key={index}>
                        {renderMobileCard ? (
                            renderMobileCard(item, index)
                        ) : (
                            <DefaultMobileCard item={item} columns={columns} />
                        )}
                    </div>
                ))}
            </div>
        </>
    );
};

// Default mobile card if no custom renderer provided
const DefaultMobileCard = ({ item, columns }) => (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 space-y-3">
        {columns.map((column, index) => (
            <div key={index} className="flex justify-between items-start">
                <span className="text-sm font-medium text-gray-500">
                    {column.header}
                </span>
                <span className="text-sm text-gray-900 text-right ml-4">
                    {column.render
                        ? column.render(item)
                        : item[column.accessor]
                    }
                </span>
            </div>
        ))}
    </div>
);

export default ResponsiveTable;
