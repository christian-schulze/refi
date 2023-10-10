import styled from '@emotion/styled';
import { observer } from 'mobx-react-lite';
import { darken, lighten } from 'polished';
import {
  ChangeEvent,
  FocusEvent,
  KeyboardEvent,
  MouseEvent,
  useEffect,
  useRef,
  useState,
} from 'react';

import { useStores } from 'stores';

import { Input } from 'components/Input';

const DocSetAlias = styled.div<{ alias: string; selected: boolean }>`
  padding-left: 4px;
  padding-right: 4px;
  border-radius: 2px;
  min-width: 200px;
  max-width: 200px;
  border: 1px dotted
    ${({ theme }) => lighten(0.05, theme.palette.background.default)};
  line-height: 23px;

  ${({ alias, selected, theme }) => {
    if (alias === '') {
      return `color: ${theme.palette.text.disabled};`;
    }
    if (selected) {
      return `
        color: ${darken(0.6, theme.palette.text.primary)} !important;
        font-weight: 600;
        
        :hover {
          color: ${darken(0.2, theme.palette.text.primary)} !important;
        }
      `;
    }
  }}

  :hover {
    background: ${({ theme }) => darken(0.1, theme.palette.primary.main)};
  }
`;

export interface EditDocSetAliasInputProps {
  name: string;
  selected: boolean;
}

export const EditDocSetAliasInput = observer(
  ({ name, selected }: EditDocSetAliasInputProps) => {
    const { docSetAliasStore } = useStores();
    const editAliasInputRef = useRef<HTMLInputElement>(null);
    const [editedAlias, setEditedAlias] = useState('');
    const [isEditingAlias, setIsEditingAlias] = useState(false);

    useEffect(() => {
      if (isEditingAlias) {
        editAliasInputRef.current?.focus();
      }
    }, [isEditingAlias]);

    const handleClickEditAlias = (_event: MouseEvent<HTMLDivElement>) => {
      if (!isEditingAlias) {
        setIsEditingAlias(true);
        setEditedAlias((docSetAliasStore.aliases[name] || name).toLowerCase());
      }
    };

    const handleBlur = (_event: FocusEvent<HTMLInputElement>) => {
      setIsEditingAlias(false);
      if (editedAlias) {
        docSetAliasStore.setAlias(name, editedAlias);
      }
    };

    const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
      setEditedAlias(event.target.value.toLowerCase());
    };

    const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
      event.stopPropagation();
      if (event.key === 'Enter') {
        event.currentTarget.blur();
        setIsEditingAlias(false);
        if (editedAlias && editedAlias !== name.toLowerCase()) {
          docSetAliasStore.setAlias(name, editedAlias);
        }
      } else if (event.key === 'Escape') {
        event.currentTarget.blur();
        setIsEditingAlias(false);
      }
    };

    const alias = docSetAliasStore.aliases[name] || '';

    return (
      <>
        {isEditingAlias ? (
          <Input
            disableUnderline
            inputRef={editAliasInputRef}
            onBlur={handleBlur}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder="Enter an alias"
            sx={{
              maxWidth: '200px',
              borderRadius: '2px',
              '.MuiInputBase-input': {
                padding: '0 4px',
              },
              border: '1px dotted transparent',
              backgroundColor: 'primary.main',
              ':hover': {
                backgroundColor: (theme) =>
                  darken(0.1, theme.palette.primary.main),
              },
              '&:focus-within': {
                borderColor: (theme) => theme.palette.secondary.main,
                backgroundColor: (theme) =>
                  darken(0.2, theme.palette.primary.main),
              },
            }}
            value={editedAlias}
          />
        ) : (
          <DocSetAlias
            alias={alias}
            onClick={handleClickEditAlias}
            selected={selected}
          >
            {alias || name.toLowerCase()}
          </DocSetAlias>
        )}
      </>
    );
  },
);
