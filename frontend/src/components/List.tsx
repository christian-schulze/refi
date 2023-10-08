import {
  CSSProperties,
  FocusEventHandler,
  forwardRef,
  ForwardedRef,
  KeyboardEventHandler,
  MouseEventHandler,
  ReactElement,
  ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import { useVirtual } from 'react-virtual';
import styled from '@emotion/styled';

// The Typescript types for `forwardRef` do not support generic prop types.
// We can work around this by augmenting the `forwardRef` type.
// More detail can be found on this blog post:
// https://fettblog.eu/typescript-react-generic-forward-refs/#option-3%3A-augment-forwardref
declare module 'react' {
  function forwardRef<T, P = {}>(
    render: (props: P, ref: Ref<T>) => ReactNode | null,
  ): (props: P & RefAttributes<T>) => ReactNode | null;
}

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

export interface RenderItemProps {
  onMouseDown: MouseEventHandler<HTMLElement>;
  selected: boolean;
  style: CSSProperties;
}

export interface ListProps<T> {
  autoSelectOnFocus?: boolean;
  className?: string;
  header?: ReactElement;
  items?: Array<T>;
  itemSize: number;
  listClassName?: string;
  onBlur?: FocusEventHandler<HTMLDivElement>;
  onCancel?: () => void;
  onSelect: (item: T, cause: SelectionCause) => void;
  renderItem: (item: T, props: RenderItemProps) => ReactNode;
  selectedItem: T | null | undefined;
  tabIndex: number;
}

const ListInner = <T,>(
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
    renderItem,
    selectedItem,
    tabIndex,
  }: ListProps<T>,
  ref: ForwardedRef<HTMLDivElement>,
) => {
  const parentRef = useRef(null);
  const [selectedIndex, setSelectedIndex] = useState(-1);

  useEffect(() => {
    if (selectedItem) {
      const index = items?.indexOf(selectedItem);
      if (index > -1) {
        setSelectedIndex(index);
      }
    }
  }, [selectedItem]);

  const rowVirtualizer = useVirtual({
    estimateSize: useCallback(() => itemSize, []),
    overscan: 5,
    parentRef,
    size: items.length,
  });

  const handleFocus: FocusEventHandler<HTMLDivElement> = (_event) => {
    if (autoSelectOnFocus && !selectedItem && items.length > 0) {
      setSelectedIndex(0);
      onSelect(items[0], 'focus');
    }
  };

  const handleKeyDown: KeyboardEventHandler<HTMLDivElement> = (event) => {
    if (['ArrowDown', 'ArrowUp'].includes(event.key)) {
      event.preventDefault();
      let newIndex = 0;
      if (event.key === 'ArrowDown') {
        newIndex = selectedIndex === items.length - 1 ? 0 : selectedIndex + 1;
      } else if (event.key === 'ArrowUp') {
        newIndex = selectedIndex === 0 ? items.length - 1 : selectedIndex - 1;
      }
      setSelectedIndex(newIndex);
      rowVirtualizer.scrollToIndex(newIndex);
      onSelect(items[newIndex], 'arrow-key');
    } else if (event.key === 'Enter') {
      onSelect(selectedItem!, 'enter-key');
    } else if (event.key === 'Escape' && onCancel) {
      onCancel();
    }
  };

  const handleMouseDown: (item: T) => MouseEventHandler<HTMLDivElement> =
    (item) => (_event) => {
      onSelect(item, 'mouse-click');
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
            let selected = false;
            if (selectedItem === listItem) {
              selected = true;
            } else if (index === selectedIndex) {
              selected = true;
            }

            return renderItem(listItem, {
              onMouseDown: handleMouseDown(listItem),
              selected,
              style: {
                position: 'absolute',
                top: '0',
                left: '0',
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
};

export const List = forwardRef(ListInner);
