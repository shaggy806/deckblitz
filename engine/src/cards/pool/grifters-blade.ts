import { defineCard } from "../define.js";
import { equip } from "../helpers.js";

// Ravnica: Clue Edition (RAV). "As this Equipment enters, choose a
// creature you control it could be attached to. If you do, it enters
// attached to that creature" (rule 614.1c) is `choosePermanentOnEnter` with
// `attach`: with no such creature it enters unattached (rule 301.5e).

const CHOOSE =
  "As this Equipment enters, choose a creature you control it could be attached to. If you do, it enters attached to that creature.";
const PUMP = "Equipped creature gets +1/+1.";

export default defineCard({
  name: "Grifter's Blade",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["artifact"],
  subtypes: ["Equipment"],
  keywords: ["flash"],
  text: `Flash\n${CHOOSE}\n${PUMP}\nEquip {1}`,
  choosePermanentOnEnter: {
    filter: { type: "creature", controlledBy: "you" },
    prompt: "Choose a creature you control for Grifter's Blade to enter attached to",
    attach: true,
  },
  static: [{ affects: { scope: "attached" }, grantPt: [1, 1], text: PUMP }],
  activated: [equip("{1}")],
});
