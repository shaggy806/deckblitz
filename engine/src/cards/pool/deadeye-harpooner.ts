import { defineCard } from "../define.js";

// EDHREC rank 23758.

export default defineCard({
  name: "Deadeye Harpooner",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Dwarf", "Warrior"],
  power: 2,
  toughness: 2,
  text: "Revolt — When this creature enters, if a permanent left the battlefield under your control this turn, destroy target tapped creature an opponent controls.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [{ kind: "permanent", whose: "opponent", filter: { tapped: true, type: "creature" } }],
      effect: { kind: "destroy", target: 0 },
      resolve: null,
      text: "Revolt — When this creature enters, if a permanent left the battlefield under your control this turn, destroy target tapped creature an opponent controls.",
      condition: { kind: "turn-history", what: "left" },
    },
  ],
});
