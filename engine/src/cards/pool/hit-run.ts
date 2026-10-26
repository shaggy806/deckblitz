import { defineCard } from "../define.js";

// Dissension. EDHREC rank 28414. The whole card: every zone but the stack
// (rule 709.4) — both names, the combined mana cost, both halves' colours.
// Never cast itself; a spell is one half or the other (hit.ts, run.ts).
const FACES = ["Hit // Run", "Hit", "Run"];
const HIT_TEXT =
  "Target player sacrifices an artifact or creature of their choice. Hit deals damage to that player equal to that permanent's mana value.";
const RUN_TEXT = "Attacking creatures you control get +1/+0 until end of turn for each other attacking creature.";

export default defineCard({
  name: "Hit // Run",
  manaCost: "{1}{B}{R}{3}{R}{G}",
  colors: ["B", "R", "G"],
  types: ["instant"],
  text: `${HIT_TEXT}\n//\n${RUN_TEXT}`,
  faces: FACES,
  split: true,
});
