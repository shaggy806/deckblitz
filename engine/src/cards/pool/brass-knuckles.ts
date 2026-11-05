import { defineCard } from "../define.js";
import { equip } from "../helpers.js";

// The copy of the permanent spell becomes a token as it resolves (rule
// 608.3f) — not "created", so token-creation effects don't see it (the
// ruling).

const CAST_TEXT = "When you cast this spell, copy it. (The copy becomes a token.)";
const DOUBLE_TEXT = "Equipped creature has double strike as long as two or more Equipment are attached to it.";

export default defineCard({
  name: "Brass Knuckles",
  manaCost: "{4}",
  colors: [],
  types: ["artifact"],
  subtypes: ["Equipment"],
  text: `${CAST_TEXT}\n${DOUBLE_TEXT}\nEquip {1} ({1}: Attach to target creature you control. Equip only as a sorcery.)`,
  triggered: [
    {
      trigger: { on: "this-cast" },
      targets: [],
      effect: { kind: "copy-spell", target: "trigger-spell" },
      resolve: null,
      text: CAST_TEXT,
    },
  ],
  static: [
    {
      affects: { scope: "attached" },
      condition: { kind: "source", filter: { attachedTo: { equipmentAttached: { op: "gte", n: 2 } } } },
      grantKeywords: ["double-strike"],
      text: DOUBLE_TEXT,
    },
  ],
  activated: [equip("{1}")],
});
