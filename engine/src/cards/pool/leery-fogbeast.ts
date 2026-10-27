import { defineCard } from "../define.js";

const TEXT = "Whenever this creature becomes blocked, prevent all combat damage that would be dealt this turn.";

export default defineCard({
  name: "Leery Fogbeast",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Beast"],
  power: 4,
  toughness: 2,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "becomes-blocked", who: "self" },
      targets: [],
      effect: { kind: "prevent-all-combat-damage" },
      resolve: null,
      text: TEXT,
    },
  ],
});
