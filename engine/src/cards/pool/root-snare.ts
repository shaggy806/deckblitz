import { defineCard } from "../define.js";

export default defineCard({
  name: "Root Snare",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["instant"],
  text: "Prevent all combat damage that would be dealt this turn.",
  targets: [],
  effect: { kind: "prevent-all-combat-damage" },
});
