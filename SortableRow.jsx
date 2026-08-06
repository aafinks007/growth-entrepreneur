import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react';

export const SortableRow = ({ id, children, style = {} }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const combinedStyle = {
    ...style,
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 1 : 0,
    position: 'relative',
    backgroundColor: isDragging ? 'rgba(59,130,246,0.1)' : 'transparent',
  };

  return (
    <tr ref={setNodeRef} style={combinedStyle}>
      <td style={{ padding: '1rem', width: '40px' }}>
        <button
          {...attributes}
          {...listeners}
          style={{
            background: 'transparent',
            border: 'none',
            cursor: 'grab',
            color: 'var(--text-secondary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '0.5rem'
          }}
        >
          <GripVertical size={20} />
        </button>
      </td>
      {children}
    </tr>
  );
};
