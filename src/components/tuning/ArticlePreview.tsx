import { Box, VStack, HStack } from "@chakra-ui/react";
import { useState, useRef, useCallback } from "react";
import { LuPencil, LuCheck, LuX } from "react-icons/lu";

/**
 * EditableText — inline contentEditable span with ✓/✗ controls.
 * Reverts to original value on Escape or clicking ✗.
 */
const EditableText = ({
  value,
  onChange,
  tag = "span",
  style,
}: {
  value: string;
  onChange: (v: string) => void;
  tag?: keyof React.JSX.IntrinsicElements;
  style?: React.CSSProperties;
}) => {
  const ref = useRef<HTMLElement>(null);
  const [editing, setEditing] = useState(false);
  const snapshot = useRef(value);

  const enter = () => {
    snapshot.current = ref.current?.textContent ?? value;
    setEditing(true);
    // Put cursor at end
    setTimeout(() => {
      const el = ref.current;
      if (!el) return;
      el.focus();
      const range = document.createRange();
      range.selectNodeContents(el);
      range.collapse(false);
      window.getSelection()?.removeAllRanges();
      window.getSelection()?.addRange(range);
    }, 0);
  };

  const commit = () => {
    onChange(ref.current?.textContent ?? value);
    setEditing(false);
  };

  const cancel = () => {
    if (ref.current) ref.current.textContent = snapshot.current;
    setEditing(false);
  };

  const Tag = tag as React.ElementType;

  return (
    <Box display="inline" position="relative">
      <Tag
        ref={ref}
        contentEditable={editing}
        suppressContentEditableWarning
        style={{
          ...style,
          outline: editing ? "1.5px dashed #6b7cf6" : "none",
          borderRadius: 2,
          padding: editing ? "0 2px" : 0,
          cursor: editing ? "text" : "inherit",
          display: "inline",
        }}
        onKeyDown={(e: React.KeyboardEvent) => {
          if (e.key === "Enter") {
            e.preventDefault();
            commit();
          }
          if (e.key === "Escape") {
            cancel();
          }
        }}
      >
        {value}
      </Tag>
      {editing && (
        <HStack
          display="inline-flex"
          gap={0.5}
          ml={1}
          verticalAlign="middle"
          position="relative"
          top="-1px"
        >
          <Box
            as="button"
            onClick={commit}
            title="Confirm"
            p={0.5}
            borderRadius="sm"
            bg="green.100"
            color="green.600"
            cursor="pointer"
            _hover={{ bg: "green.200" }}
            lineHeight={1}
          >
            <LuCheck size={10} />
          </Box>
          <Box
            as="button"
            onClick={cancel}
            title="Cancel"
            p={0.5}
            borderRadius="sm"
            bg="red.100"
            color="red.500"
            cursor="pointer"
            _hover={{ bg: "red.200" }}
            lineHeight={1}
          >
            <LuX size={10} />
          </Box>
        </HStack>
      )}
      {!editing && (
        <Box
          as="button"
          onClick={enter}
          display="inline-flex"
          ml={0.5}
          p={0.5}
          borderRadius="sm"
          opacity={0}
          color="gray.400"
          cursor="pointer"
          _hover={{ opacity: 1, color: "blue.500" }}
          _groupHover={{ opacity: 1 }}
          verticalAlign="middle"
          position="relative"
          top="-1px"
          title="Edit"
          transition="opacity 0.1s"
        >
          <LuPencil size={9} />
        </Box>
      )}
    </Box>
  );
};

function useArticleContent() {
  const [title, setTitle] = useState("Exploring the mysteries of Atlantis");
  const [blog, setBlog] = useState("The Blog");
  const [byline, setByline] = useState("Feb 23rd, 2026 — By Seraphina");
  const [sections, setSections] = useState([
    {
      id: 1,
      heading: "The origins of Atlantis",
      headingStep: 4,
      body: "The first mention of Atlantis can be traced back to the works of the ancient Greek philosopher Plato. He described a powerful and advanced civilization that disappeared beneath the ocean's surface, leaving behind only speculation and intrigue.",
    },
    {
      id: 2,
      heading: "Theories and speculations",
      headingStep: 3,
      body: "Over the years, numerous theories and speculations have arisen regarding the existence and fate of Atlantis. Some believe it was a highly advanced society with technology far beyond its time, while others argue that it was purely a product of Plato's imagination.",
    },
    {
      id: 3,
      heading: "Advanced technology",
      headingStep: 2,
      body: "One theory suggests that Atlantis possessed technology that allowed it to harness the Earth's energy, leading to its eventual downfall. Theorists propose that their unchecked power may have contributed to their watery demise.",
    },
    {
      id: 4,
      heading: "Geological evidence",
      headingStep: 1,
      body: "Geological formations and underwater structures have led some researchers to believe they may have found the remnants of Atlantis. Could these enigmatic formations on the ocean floor be the lost city?",
    },
    {
      id: 5,
      heading: "Conclusion",
      headingStep: 0,
      body: "The mystery of Atlantis continues to intrigue and baffle historians, archaeologists, and enthusiasts alike. Whether Atlantis was real or a mere figment of Plato's imagination remains an unsolved riddle.",
    },
  ]);

  const updateSection = useCallback(
    (id: number, field: "heading" | "body", value: string) => {
      setSections((prev) =>
        prev.map((s) => (s.id === id ? { ...s, [field]: value } : s)),
      );
    },
    [],
  );

  return {
    title,
    setTitle,
    blog,
    setBlog,
    byline,
    setByline,
    sections,
    updateSection,
  };
}

export function ArticlePreview({
  baseSize,
  scaleRatio,
  headingFont,
  bodyFont,
  headingWeight = 700,
  bodyWeight = 400,
  headingLH = 1.2,
  bodyLH = 1.5,
  headingLS = 0,
  bodyLS = 0,
}: {
  baseSize: number;
  scaleRatio: number;
  headingFont: string;
  bodyFont: string;
  headingWeight?: number;
  bodyWeight?: number;
  headingLH?: number;
  bodyLH?: number;
  headingLS?: number;
  bodyLS?: number;
}) {
  const {
    title,
    setTitle,
    blog,
    setBlog,
    byline,
    setByline,
    sections,
    updateSection,
  } = useArticleContent();

  const s = (step: number) =>
    `${Math.round(baseSize * Math.pow(scaleRatio, step) * 100) / 100}px`;

  const hStyle = (step: number): React.CSSProperties => ({
    fontFamily: headingFont,
    fontSize: s(step),
    lineHeight: `${headingLH}`,
    fontWeight: headingWeight,
    letterSpacing: `${headingLS}em`,
    margin: 0,
    padding: 0,
    color: "var(--chakra-colors-gray-800)",
  });

  const pStyle: React.CSSProperties = {
    fontFamily: bodyFont,
    fontSize: s(0),
    lineHeight: `${bodyLH}`,
    fontWeight: bodyWeight,
    letterSpacing: `${bodyLS}em`,
    margin: 0,
    padding: 0,
    color: "var(--chakra-colors-gray-600)",
  };

  const smallStyle: React.CSSProperties = {
    fontFamily: bodyFont,
    fontSize: s(-1),
    lineHeight: `${bodyLH}`,
    color: "var(--chakra-colors-gray-400)",
  };

  return (
    <Box
      border="1px solid"
      borderColor="gray.100"
      borderRadius="md"
      p={4}
      maxH="500px"
      overflowY="auto"
      // Pencil buttons are transparent by default; CSS below reveals them on hover
      data-article-preview
    >
      <style>{`[data-article-preview] .edit-pencil { opacity: 0; transition: opacity 0.1s; }
        [data-article-preview]:hover .edit-pencil { opacity: 1; }`}</style>
      <VStack align="stretch" gap={3}>
        {/* Blog header */}
        <h2 style={hStyle(4)}>
          <Box as="span" display="inline-block" mr={1.5}>
            <svg
              style={{ height: "1em", width: "auto", verticalAlign: "bottom" }}
              viewBox="0 0 72 72"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="m0,72c39.76,0,72-32.24,72-72H0v72Z"
                fill="rgba(0,0,0,0.12)"
              />
            </svg>
          </Box>
          <EditableText value={blog} onChange={setBlog} style={hStyle(4)} />
        </h2>

        <h1 style={hStyle(6)}>
          <EditableText value={title} onChange={setTitle} style={hStyle(6)} />
        </h1>

        <p style={smallStyle}>
          <EditableText
            value={byline}
            onChange={setByline}
            style={smallStyle}
          />
        </p>

        {sections.map((sec) => (
          <Box key={sec.id}>
            <Box
              as={`h${7 - sec.headingStep}` as React.ElementType}
              style={hStyle(sec.headingStep)}
              mb={1}
            >
              <EditableText
                value={sec.heading}
                onChange={(v) => updateSection(sec.id, "heading", v)}
                style={hStyle(sec.headingStep)}
              />
            </Box>
            <p style={pStyle}>
              <EditableText
                value={sec.body}
                onChange={(v) => updateSection(sec.id, "body", v)}
                style={pStyle}
              />
            </p>
          </Box>
        ))}
      </VStack>
    </Box>
  );
}
