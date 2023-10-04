import {
  cloneElement,
  FocusEventHandler,
  forwardRef,
  KeyboardEventHandler,
  MouseEventHandler,
  ReactElement,
  useCallback,
  useRef,
} from 'react';
import { useVirtual } from 'react-virtual';
import styled from '@emotion/styled';

const Container = styled.div`
  display: flex;
  flex-direction: column;
`;

const ListWrapper = styled.div`
  flex-grow: 1;
  overflow-y: auto;
`;

export type SelectionCause =
  | 'arrow-key'
  | 'enter-key'
  | 'mouse-click'
  | 'focus';

export interface ListProps {
  autoSelectOnFocus?: boolean;
  className?: string;
  header?: ReactElement;
  items?: Array<ReactElement>;
  itemSize: number;
  listClassName?: string;
  onBlur?: FocusEventHandler<HTMLDivElement>;
  onCancel?: () => void;
  onSelect: (id: string, cause: SelectionCause) => void;
  selectedId?: string;
  tabIndex: number;
}

export const List = forwardRef<HTMLDivElement, ListProps>(
  (
    {
      autoSelectOnFocus = true,
      className,
      header,
      items = [],
      itemSize,
      listClassName,
      onBlur,
      onCancel,
      onSelect,
      selectedId = '',
      tabIndex,
    },
    ref,
  ) => {
    const parentRef = useRef(null);
    const selectedIndexRef = useRef(-1);

    const rowVirtualizer = useVirtual({
      estimateSize: useCallback(() => itemSize, []),
      overscan: 5,
      parentRef,
      size: items.length,
    });

    const handleFocus: FocusEventHandler<HTMLDivElement> = (_event) => {
      if (autoSelectOnFocus && !selectedId && items.length > 0) {
        const id = items[0].props['data-id'];
        selectedIndexRef.current = 0;
        onSelect(id, 'focus');
      }
    };

    const handleKeyDown: KeyboardEventHandler<HTMLDivElement> = (event) => {
      if (['ArrowDown', 'ArrowUp'].includes(event.key)) {
        event.preventDefault();
        let newIndex = 0;
        if (event.key === 'ArrowDown') {
          newIndex =
            selectedId === '' || selectedIndexRef.current === items.length - 1
              ? 0
              : selectedIndexRef.current + 1;
        } else if (event.key === 'ArrowUp') {
          newIndex =
            selectedId === '' || selectedIndexRef.current === 0
              ? items.length - 1
              : selectedIndexRef.current - 1;
        }
        selectedIndexRef.current = newIndex;
        const id = items[newIndex].props['data-id'];
        rowVirtualizer.scrollToIndex(newIndex);
        onSelect(id, 'arrow-key');
      } else if (event.key === 'Enter') {
        onSelect(selectedId, 'enter-key');
      } else if (event.key === 'Escape' && onCancel) {
        onCancel();
      }
    };

    const handleMouseDown: (id: string) => MouseEventHandler<HTMLDivElement> =
      (id: string) => (_event) => {
        onSelect(id, 'mouse-click');
      };

    return (
      <Container
        className={className}
        onBlur={onBlur}
        onFocus={handleFocus}
        onKeyDown={handleKeyDown}
        ref={ref}
        tabIndex={tabIndex}
      >
        {header}
        <ListWrapper className={listClassName} ref={parentRef}>
          <div
            style={{
              height: `${rowVirtualizer.totalSize}px`,
              width: '100%',
              position: 'relative',
            }}
          >
            {rowVirtualizer.virtualItems.map((virtualRow) => {
              const { index } = virtualRow;
              const listItem = items[index];
              const id = listItem.props['data-id'];
              let selected = false;
              if (selectedId === id) {
                selected = true;
                selectedIndexRef.current = index;
              }
              return cloneElement(listItem, {
                key: id,
                onMouseDown: handleMouseDown(id),
                selected,
                style: {
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  minHeight: `${virtualRow.size}px`,
                  maxHeight: `${virtualRow.size}px`,
                  transform: `translateY(${virtualRow.start}px)`,
                },
              });
            })}
          </div>
        </ListWrapper>
      </Container>
    );
  },
);
