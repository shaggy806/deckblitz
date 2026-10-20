import { defineCard } from "../define.js";

// Both choices — the card type, then tap or untap — are made as it resolves
// (no "Choose one —" at casting), by its controller with nothing revealed in
// between: one resolution-time choice among the six (`modal`, not announced).
export default defineCard({
  name: "Turnabout",
  manaCost: "{2}{U}{U}",
  colors: ["U"],
  types: ["instant"],
  text: "Choose artifact, creature, or land. Tap all untapped permanents of the chosen type target player controls, or untap all tapped permanents of that type that player controls.",
  targets: ["player"],
  effect: {
    kind: "modal",
    minModes: 1,
    maxModes: 1,
    modes: [
      {
        text: "Tap all untapped artifacts target player controls.",
        effect: { kind: "tap-all", filter: { type: "artifact", controlledBy: "you" }, controlledByTarget: 0 },
      },
      {
        text: "Untap all tapped artifacts target player controls.",
        effect: { kind: "untap-all", filter: { type: "artifact", controlledBy: "you" }, controlledByTarget: 0 },
      },
      {
        text: "Tap all untapped creatures target player controls.",
        effect: { kind: "tap-all", filter: { type: "creature", controlledBy: "you" }, controlledByTarget: 0 },
      },
      {
        text: "Untap all tapped creatures target player controls.",
        effect: { kind: "untap-all", filter: { type: "creature", controlledBy: "you" }, controlledByTarget: 0 },
      },
      {
        text: "Tap all untapped lands target player controls.",
        effect: { kind: "tap-all", filter: { type: "land", controlledBy: "you" }, controlledByTarget: 0 },
      },
      {
        text: "Untap all tapped lands target player controls.",
        effect: { kind: "untap-all", filter: { type: "land", controlledBy: "you" }, controlledByTarget: 0 },
      },
    ],
  },
});
