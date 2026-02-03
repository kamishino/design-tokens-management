import { 
  VStack, Text, Input, Field, Box, createListCollection
} from "@chakra-ui/react";
import { 
  DialogRoot, 
  DialogContent, 
  DialogHeader, 
  DialogBody, 
  DialogTitle, 
  DialogCloseTrigger 
} from "../ui/dialog";
import {
  SelectContent,
  SelectItem,
  SelectRoot,
  SelectTrigger,
  SelectValueText,
} from "../ui/select";
import { SUPPORTED_IDES, useAppSettings } from "../../hooks/useAppSettings";
import { useMemo } from "react";

interface SettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const SettingsModal = ({ open, onOpenChange }: SettingsModalProps) => {
  const { settings, updateSettings } = useAppSettings();

  const ideCollection = useMemo(() => {
    return createListCollection({
      items: SUPPORTED_IDES.map(ide => ({
        label: ide.name,
        value: ide.id
      }))
    });
  }, []);

  return (
    <DialogRoot lazyMount open={open} onOpenChange={(e) => onOpenChange(e.open)} size="lg" placement="center">
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Dev Environment Settings</DialogTitle>
          <DialogCloseTrigger />
        </DialogHeader>
        <DialogBody pb={8}>
          <VStack align="stretch" gap={6}>
            <Field.Root>
              <Field.Label fontSize="xs" fontWeight="bold" color="gray.500">PROJECT ROOT PATH</Field.Label>
              <Input 
                size="sm"
                value={settings.rootPath}
                onChange={(e) => updateSettings({ rootPath: e.target.value })}
                placeholder="e.g., D:/Tools/design-tokens-management"
              />
              <Field.HelperText fontSize="10px">
                Absolute path used for IDE deep links.
              </Field.HelperText>
            </Field.Root>

            <Field.Root>
              <Field.Label fontSize="xs" fontWeight="bold" color="gray.500">DEFAULT IDE</Field.Label>
              <SelectRoot 
                collection={ideCollection} 
                size="sm"
                value={[settings.preferredIde]}
                onValueChange={(e) => updateSettings({ preferredIde: e.value[0] })}
                positioning={{ strategy: "fixed" }}
              >
                <SelectTrigger>
                  <SelectValueText placeholder="Select IDE" />
                </SelectTrigger>
                <SelectContent zIndex={2100}>
                  {ideCollection.items.map((item) => (
                    <SelectItem item={item} key={item.value}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </SelectRoot>
              <Field.HelperText fontSize="10px">
                Default editor for "Jump to Code" actions.
              </Field.HelperText>
            </Field.Root>

            <Box bg="blue.50" p={4} borderRadius="md">
              <Text fontSize="11px" color="blue.700" fontWeight="medium">
                Tip: The root path is automatically detected when running "npm run dev", but you can override it here if needed.
              </Text>
            </Box>
          </VStack>
        </DialogBody>
      </DialogContent>
    </DialogRoot>
  );
};
