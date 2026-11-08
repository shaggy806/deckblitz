import { defineCard } from "../define.js";

const BLOCK_TEXT = "All Walls able to block this creature do so.";
const PREVENT_TEXT = "Prevent all combat damage that would be dealt to this creature by Walls.";

export default defineCard({
  name: "Marble Priest",
  manaCost: "{5}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Cleric"],
  power: 3,
  toughness: 3,
  text: `${BLOCK_TEXT}\n${PREVENT_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      restrictions: [{ kind: "must-be-blocked", by: { type: "creature", subtype: "Wall" } }],
      text: BLOCK_TEXT,
    },
    {
      affects: { scope: "self" },
      replacement: { event: "would-deal-damage", combat: true, instead: { prevent: true }, to: "self", source: { subtype: "Wall" } },
      text: PREVENT_TEXT,
    },
  ],
});
