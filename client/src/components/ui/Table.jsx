/**
 * Table Component
 * 
 * Styled table for data display in dashboards.
 */
import { cn } from '@/lib/utils';

const Table = ({ children, className, ...props }) => (
    <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table
            className={cn('w-full text-sm text-left', className)}
            {...props}
        >
            {children}
        </table>
    </div>
);

const TableHeader = ({ children, className, ...props }) => (
    <thead
        className={cn('bg-gray-50 text-gray-600 uppercase text-xs', className)}
        {...props}
    >
        {children}
    </thead>
);

const TableBody = ({ children, className, ...props }) => (
    <tbody
        className={cn('divide-y divide-gray-200', className)}
        {...props}
    >
        {children}
    </tbody>
);

const TableRow = ({ children, className, onClick, ...props }) => (
    <tr
        onClick={onClick}
        className={cn(
            'bg-white',
            onClick && 'cursor-pointer hover:bg-gray-50 transition-colors',
            className
        )}
        {...props}
    >
        {children}
    </tr>
);

const TableHead = ({ children, className, ...props }) => (
    <th
        className={cn('px-6 py-3 font-semibold tracking-wider', className)}
        {...props}
    >
        {children}
    </th>
);

const TableCell = ({ children, className, ...props }) => (
    <td
        className={cn('px-6 py-4 whitespace-nowrap', className)}
        {...props}
    >
        {children}
    </td>
);

const TableEmpty = ({ message = 'No data available', colSpan = 1 }) => (
    <tr>
        <td
            colSpan={colSpan}
            className="px-6 py-12 text-center text-gray-500"
        >
            {message}
        </td>
    </tr>
);

Table.Header = TableHeader;
Table.Body = TableBody;
Table.Row = TableRow;
Table.Head = TableHead;
Table.Cell = TableCell;
Table.Empty = TableEmpty;

export default Table;
