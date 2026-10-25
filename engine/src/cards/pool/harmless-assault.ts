import { defineCard } from "../define.js";

// Only attacking creatures' combat damage is prevented; blockers' isn't (the
// ruling). Asked of each source as its damage would be dealt.
export default defineCard({
  name: "Harmless Assault",
  manaCost: "{2}{W}{W}",
  colors: ["W"],
  types: ["instant"],
  text: "Prevent all combat damage that would be dealt this turn by attacking creatures.",
  targets: [],
  effect: { kind: "prevent-all-combat-damage", by: { type: "creature", attacking: true } },
});
