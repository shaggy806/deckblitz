import { defineCard } from "../define.js";

const PREY_TEXT = "{B}, Reveal this card from your hand: Put a prey counter on target creature. Activate only during your turn.";
const ETB_TEXT = "When Tetzimoc enters, destroy each creature your opponents control with a prey counter on it.";

export default defineCard({
  name: "Tetzimoc, Primal Death",
  manaCost: "{4}{B}{B}",
  colors: ["B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Elder", "Dinosaur"],
  power: 6,
  toughness: 6,
  keywords: ["deathtouch"],
  text: `Deathtouch\n${PREY_TEXT}\n${ETB_TEXT}`,
  activated: [
    {
      // A hand ability that keeps its card in the hand reveals it as it's
      // activated (rule 602.2a) — the "Reveal this card" cost.
      cost: { mana: "{B}", tap: false },
      zone: "hand",
      staysInZone: true,
      condition: { kind: "your-turn" },
      targets: ["creature"],
      effect: { kind: "add-counter", target: 0, counter: "prey", amount: 1 },
      resolve: null,
      text: PREY_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "destroy-all",
        filter: { type: "creature", controlledBy: "opponent", counters: { kind: "prey", compare: { op: "gte", n: 1 } } },
      },
      resolve: null,
      text: ETB_TEXT,
    },
  ],
});
