import { defineCard } from "../define.js";

// EDHREC rank 7155.

const METALCRAFT_TEXT =
  "Metalcraft — Artifacts you control have shroud as long as you control three or more artifacts. (An artifact with shroud can't be the target of spells or abilities.)";

export default defineCard({
  name: "Indomitable Archangel",
  manaCost: "{2}{W}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Angel"],
  power: 4,
  toughness: 4,
  keywords: ["flying"],
  text: `Flying\n${METALCRAFT_TEXT}`,
  static: [
    {
      affects: { scope: "filter", filter: { type: "artifact", controlledBy: "you" } },
      condition: { kind: "metalcraft" },
      grantKeywords: ["shroud"],
      text: METALCRAFT_TEXT,
    },
  ],
});
