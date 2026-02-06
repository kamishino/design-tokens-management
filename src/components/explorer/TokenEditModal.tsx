import { 
  Box, VStack, HStack, Text, Input, 
  Textarea, Field, Group, IconButton
} from "@chakra-ui/react";
import { 
  DialogBody,
  DialogCloseTrigger,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogRoot,
  DialogTitle,
} from "../ui/dialog";
import { 
  NativeSelectRoot,
  NativeSelectField
} from "../ui/native-select";
import { Button } from "../ui/button";
import { useState, useEffect, useRef } from 'react';
import type { TokenDoc } from "../../utils/token-parser";
import { ReferencePicker } from "./ReferencePicker";
import { LuLink } from "react-icons/lu";

interface TokenEditModalProps {
  isOpen: boolean;
  onClose: (refresh?: boolean) => void;
  token?: TokenDoc | null;
  targetPath: string; // The physical file path
  initialCategory?: string;
  globalTokens: TokenDoc[];
}

const TOKEN_TYPE_GROUPS = [
  {
    label: 'Standard (W3C DTCG)',
    items: [
      { value: 'color', label: 'Color' },
      { value: 'dimension', label: 'Dimension' },
      { value: 'fontFamilies', label: 'Font Family' },
      { value: 'fontWeights', label: 'Font Weight' },
      { value: 'lineHeights', label: 'Line Height' },
      { value: 'duration', label: 'Duration' },
      { value: 'cubicBezier', label: 'Cubic Bezier' },
    ]
  },
  {
    label: 'Tokens Studio (Figma)',
    items: [
      { value: 'spacing', label: 'Spacing' },
      { value: 'borderRadius', label: 'Border Radius' },
      { value: 'borderWidth', label: 'Border Width' },
      { value: 'opacity', label: 'Opacity' },
      { value: 'boxShadow', label: 'Box Shadow' },
      { value: 'fontSizes', label: 'Font Size' },
      { value: 'letterSpacing', label: 'Letter Spacing' },
    ]
  },
  {
    label: 'Custom',
    items: [
      { value: 'other', label: 'Other / Raw' }
    ]
  }
];

export const TokenEditModal = ({ isOpen, onClose, token, targetPath, initialCategory, globalTokens }: TokenEditModalProps) => {
  const [name, setName] = useState('');
  const [value, setValue] = useState('');
  const [type, setType] = useState('color');
  const [description, setDescription] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);

  // Reference Picker State
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [refSearch, setRefSearch] = useState('');
  const [anchorRect, setAnchorRect] = useState<DOMRect | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (token) {
      // Extract the dot-notation path from the composite ID (e.g. "file:path" -> "path")
      const dotPath = token.id.includes(':') ? token.id.split(':')[1] : token.id;
      setName(dotPath);
      setValue(typeof token.value === 'object' ? JSON.stringify(token.value) : String(token.value));
      setType(token.type);
      setDescription(token.description || '');
    } else {
      setName(initialCategory ? `${initialCategory}.` : '');
      setValue('');
      setType('color');
      setDescription('');
    }
    setIsPickerOpen(false);
  }, [token, initialCategory, isOpen]);

  const handleValueChange = (val: string) => {
    setValue(val);

    // Detect { trigger
    const lastOpenBrace = val.lastIndexOf('{');
    const lastCloseBrace = val.lastIndexOf('}');

    if (lastOpenBrace !== -1 && lastOpenBrace > lastCloseBrace) {
      const search = val.slice(lastOpenBrace + 1);
      setRefSearch(search);
      setIsPickerOpen(true);
      if (inputRef.current) {
        setAnchorRect(inputRef.current.getBoundingClientRect());
      }
    } else {
      setIsPickerOpen(false);
    }
  };

  const handleSelectReference = (tokenName: string) => {
    const lastOpenBrace = value.lastIndexOf('{');
    const newValue = value.slice(0, lastOpenBrace) + `{${tokenName}}`;
    setValue(newValue);
    setIsPickerOpen(false);
  };

  const handleSave = async () => {
    setIsSyncing(true);
    try {
      const response = await fetch('/api/save-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetPath,
          tokenPath: name,
          valueObj: {
            "$value": value,
            "$type": type,
            "$description": description
          },
          action: 'update'
        })
      });

      if (response.ok) {
        onClose(true);
      } else {
        console.error('Failed to save token');
      }
    } catch (e) {
      console.error('Error saving token', e);
    } finally {
      setIsSyncing(false);
    }
  };

  const isNew = !token;

  return (
    <DialogRoot open={isOpen} onOpenChange={(details: { open: boolean }) => !details.open && onClose()} size="lg">
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isNew ? 'Create New Token' : 'Edit Token'}</DialogTitle>
          <Text fontSize="xs" color="gray.500" mt={1}>Target: {targetPath}</Text>
        </DialogHeader>
        <DialogBody>
          <VStack gap={6} align="stretch" py={2}>
            <Field.Root>
              <Field.Label fontWeight="bold">Token Name (Dot Notation)</Field.Label>
              <Input 
                placeholder="e.g. color.brand.primary" 
                value={name} 
                onChange={(e) => setName(e.target.value)}
                disabled={!isNew}
              />
              <Field.HelperText>Standard hierarchy: category.group.name</Field.HelperText>
            </Field.Root>

            <HStack gap={6} align="flex-start">
              <Field.Root flex={1}>
                <Field.Label fontWeight="bold">Type</Field.Label>
                <NativeSelectRoot>
                  <NativeSelectField
                    value={type}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setType(e.target.value)}
                  >
                    {TOKEN_TYPE_GROUPS.map((group) => (
                      <optgroup key={group.label} label={group.label}>
                        {group.items.map((item) => (
                          <option key={item.value} value={item.value}>
                            {item.label}
                          </option>
                        ))}
                      </optgroup>
                    ))}
                  </NativeSelectField>
                </NativeSelectRoot>
              </Field.Root>

              <Field.Root flex={2}>
                <Field.Label fontWeight="bold">Value</Field.Label>
                <HStack gap={3}>
                  <Group attached w="full">
                    <Input 
                      ref={inputRef}
                      placeholder="e.g. #FFFFFF or {color.blue.500}" 
                      value={value} 
                      onChange={(e) => handleValueChange(e.target.value)}
                    />
                    <IconButton
                      aria-label="Link reference"
                      variant="subtle"
                      onClick={() => {
                        if (!value.includes('{')) {
                          setValue(value + '{');
                          setRefSearch('');
                        }
                        setIsPickerOpen(true);
                        if (inputRef.current) {
                          setAnchorRect(inputRef.current.getBoundingClientRect());
                        }
                      }}
                    >
                      <LuLink />
                    </IconButton>
                  </Group>
                  {type === 'color' && !value.includes('{') && (
                    <Box w="40px" h="40px" bg={value} borderRadius="md" border="1px solid" borderColor="gray.200" flexShrink={0} />
                  )}
                </HStack>
              </Field.Root>
            </HStack>

            <ReferencePicker 
              isOpen={isPickerOpen}
              tokens={globalTokens}
              searchTerm={refSearch}
              filterType={type}
              onSelect={handleSelectReference}
              anchorRect={anchorRect}
            />

            <Field.Root>
              <Field.Label fontWeight="bold">Description</Field.Label>
              <Textarea 
                placeholder="Explain the purpose of this token..." 
                value={description} 
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </Field.Root>
          </VStack>
        </DialogBody>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onClose()}>Cancel</Button>
          <Button colorPalette="blue" loading={isSyncing} onClick={handleSave}>
            {isNew ? 'Create Token' : 'Save Changes'}
          </Button>
        </DialogFooter>
        <DialogCloseTrigger />
      </DialogContent>
    </DialogRoot>
  );
};
