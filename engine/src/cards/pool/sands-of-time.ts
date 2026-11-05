import { defineCard } from "../define.js";

// One simultaneous event, each permanent's state read as it was: nobody can act
// between the taps and the untaps, and a permanent flips only once.
const SKIP_TEXT = "Each player skips their untap step.";
const UPKEEP_TEXT =
  "At the beginning of each player's upkeep, that player simultaneously untaps each tapped artifact, creature, and land they control and taps each untapped artifact, creature, and land they control.";

export default defineCard({
  name: "Sands of Time",
  manaCost: "{4}",
  colors: [],
  types: ["artifact"],
  text: `${SKIP_TEXT}\n${UPKEEP_TEXT}`,
  static: [{ affects: { scope: "self" }, skipsSteps: { who: "each-player", steps: ["untap"] }, text: SKIP_TEXT }],
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "any" },
      targets: [],
      effect: {
        kind: "for-each-permanent",
        filter: { typesAnyOf: ["artifact", "creature", "land"], controlledBy: "active-player" },
        simultaneous: true,
        effect: {
          kind: "conditional",
          condition: { kind: "target", index: 0, filter: { tapped: true } },
          then: { kind: "untap", target: 0 },
          else: { kind: "tap", target: 0 },
        },
      },
      resolve: null,
      text: UPKEEP_TEXT,
    },
  ],
});
