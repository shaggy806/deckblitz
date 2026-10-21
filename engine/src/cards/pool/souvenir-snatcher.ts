import { defineCard } from "../define.js";

// Mutate {5}{U}. "Gain control of target noncreature artifact" lasts
// indefinitely — not until end of turn, and not only while the Snatcher stays
// (its rulings) — so a plain `gain-control`.

const TRIGGER_TEXT = "Whenever this creature mutates, gain control of target noncreature artifact.";

export default defineCard({
  name: "Souvenir Snatcher",
  manaCost: "{4}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Bird"],
  power: 4,
  toughness: 4,
  keywords: ["flying"],
  mutate: "{5}{U}",
  text: `Mutate {5}{U} (If you cast this spell for its mutate cost, put it over or under target non-Human creature you own. They mutate into the creature on top plus all abilities from under it.)\nFlying\n${TRIGGER_TEXT}`,
  triggered: [
    {
      trigger: { on: "mutates", who: "self" },
      targets: [{ kind: "permanent", filter: { type: "artifact", notTypes: ["creature"] } }],
      effect: { kind: "gain-control", target: 0, untilEndOfTurn: false },
      resolve: null,
      text: TRIGGER_TEXT,
    },
  ],
});
