import { 
  VStack, Text, Input, Field, Box
} from "@chakra-ui/react";
import { 
  DialogRoot, 
  DialogContent, 
  DialogHeader, 
  DialogBody, 
  DialogTitle, 
  DialogCloseTrigger 
} from "../ui/dialog";
import { NativeSelectRoot, NativeSelectField } from "../ui/native-select";
import { SUPPORTED_IDES, useAppSettings } from "../../hooks/useAppSettings";

interface SettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const SettingsModal = ({ open, onOpenChange }: SettingsModalProps) => {
  const { settings, updateSettings } = useAppSettings();

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
              <NativeSelectRoot size="sm">
                <NativeSelectField
                  value={settings.preferredIde}
                  onChange={(e) => updateSettings({ preferredIde: e.target.value })}
                >
                  {SUPPORTED_IDES.map((ide) => (
                    <option key={ide.id} value={ide.id}>
                      {ide.name}
                    </option>
                  ))}
                </NativeSelectField>
              </NativeSelectRoot>
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