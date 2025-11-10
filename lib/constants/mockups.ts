import type { MockupDefinition } from "@/types/mockup";

export const MOCKUP_DEFINITIONS: MockupDefinition[] = [
  {
    id: "mac-1",
    name: "MacBook Air",
    type: "macbook",
    src: "/mockups/mac/macbook-air.png",
    screenArea: {
      x: 0.095,
      y: 0.04,
      width: 0.81,
      height: 0.665,
    },
  },
  {
    id: "mac-2",
    name: "MacBook Pro",
    type: "macbook",
    src: "/mockups/mac/macbook-pro.png",
    screenArea: {
      x: 0.095,
      y: 0.04,
      width: 0.81,
      height: 0.665,
    },
  },
  {
    id: "iphone-1",
    name: "iPhone",
    type: "iphone",
    src: "/mockups/iphone/iphone.png",
    screenArea: {
      x: 0.048,
      y: 0.02,
      width: 0.904,
      height: 0.96,
      borderRadius: 40,
      notch: {
        x: 0.31,
        y: 0.022,
        width: 0.38,
        height: 0.034,
        borderRadius: 18,
      },
    },
  },
];

export const getMockupDefinition = (
  id: string,
): MockupDefinition | undefined => {
  return MOCKUP_DEFINITIONS.find((def) => def.id === id);
};

export const getMockupsByType = (
  type: "iphone" | "macbook",
): MockupDefinition[] => {
  return MOCKUP_DEFINITIONS.filter((def) => def.type === type);
};
