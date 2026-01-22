
import React, { useEffect, useRef } from 'react';
import { Copy, Scissors, Clipboard, Trash2, ArrowUp, ArrowDown, Layers, MousePointer2, Group, Ungroup } from 'lucide-react';

interface ContextMenuProps {
  x: number;
  y: number;
  elementId: string | null;
  isMulti?: boolean;
  onClose: () => void;
  onAction: (action: string) => void;
}

const ContextMenu: React.FC<ContextMenuProps> = ({ x, y, elementId, isMulti, onClose, onAction }) => {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  const MenuItem = ({ icon: Icon, label, action, shortcut, danger }: any) => (
    <button
      onClick={() => {
        onAction(action);
        onClose();
      }}
      className={`w-full px-3 py-1.5 text-xs flex items-center justify-between hover:bg-indigo-50 transition-colors ${danger ? 'text-red-500 hover:bg-red-50' : 'text-gray-700'}`}
    >
      <div className="flex items-center gap-2">
        <Icon size={14} />
        <span>{label}</span>
      </div>
      {shortcut && <span className="text-[10px] text-gray-400 font-mono">{shortcut}</span>}
    </button>
  );

  return (
    <div
      ref={menuRef}
      className="fixed z-[9999] bg-white border border-gray-200 shadow-2xl rounded-lg py-1 w-48 overflow-hidden animate-in fade-in zoom-in-95 duration-100"
      style={{ top: y, left: x }}
    >
      {elementId || isMulti ? (
        <>
          {isMulti && <MenuItem icon={Group} label="Group" action="group" shortcut="Ctrl+G" />}
          {elementId && !isMulti && <MenuItem icon={Ungroup} label="Ungroup" action="ungroup" shortcut="Ctrl+Shift+G" />}
          <div className="h-px bg-gray-100 my-1" />
          <MenuItem icon={Scissors} label="Cut" action="cut" shortcut="Ctrl+X" />
          <MenuItem icon={Copy} label="Copy" action="copy" shortcut="Ctrl+C" />
          <MenuItem icon={Clipboard} label="Paste" action="paste" shortcut="Ctrl+V" />
          <div className="h-px bg-gray-100 my-1" />
          <MenuItem icon={MousePointer2} label="Duplicate" action="duplicate" shortcut="Ctrl+D" />
          <div className="h-px bg-gray-100 my-1" />
          <div className="px-3 py-1 text-[9px] font-bold text-gray-400 uppercase tracking-widest">Order</div>
          <MenuItem icon={ArrowUp} label="Bring to Front" action="bringFront" />
          <MenuItem icon={ArrowDown} label="Send to Back" action="sendBack" />
          <div className="h-px bg-gray-100 my-1" />
          <MenuItem icon={Trash2} label="Delete" action="delete" shortcut="Del" danger />
        </>
      ) : (
        <MenuItem icon={Clipboard} label="Paste" action="paste" shortcut="Ctrl+V" />
      )}
    </div>
  );
};

export default ContextMenu;
