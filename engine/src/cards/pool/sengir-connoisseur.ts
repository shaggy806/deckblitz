import { defineCard } from "../define.js";

const TEXT =
  "Whenever one or more other creatures die, put a +1/+1 counter on this creature. This ability triggers only once each turn.";

export default defineCard({
  name: "Sengir Connoisseur",
  manaCost: "{3}{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Vampire"],
  power: 3,
  toughness: 3,
  keywords: ["flying"],
  text: `Flying\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "dies", who: "any", filter: { type: "creature" }, otherOnly: true },
      oncePerTurn: true,
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
      resolve: null,
      text: TEXT,
    },
  ],
});
