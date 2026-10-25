import { defineCard } from "../define.js";

const TEXT =
  "Constellation — Whenever this creature or another enchantment you control enters, target creature must be blocked this turn if able.";

// It is an enchantment itself, so one enchantment-you-control enters
// trigger is "this creature or another enchantment you control".
export default defineCard({
  name: "Goldenhide Ox",
  manaCost: "{5}{G}",
  colors: ["G"],
  types: ["enchantment", "creature"],
  subtypes: ["Ox"],
  power: 5,
  toughness: 4,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "you-control", filter: { type: "enchantment" } },
      targets: ["creature"],
      effect: { kind: "restrict", target: 0, restrictions: ["must-be-blocked-if-able"] },
      resolve: null,
      text: TEXT,
    },
  ],
});
