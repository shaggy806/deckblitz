import { defineCard } from "../define.js";

// EDHREC rank 11700.
//
// The opponent's creature is an optional target. Chosen and gone illegal,
// it's the ability's only target, so the whole ability does nothing and the
// Turtle stays untapped (rule 608.2b — the ruling); with no target chosen,
// the Turtle still taps itself and stays tapped (the other ruling). Each
// misses its own controller's next untap step.
const DRAG_TEXT =
  "Drag Below — When this creature enters, tap it and up to one target creature an opponent controls. They don't untap during their controllers' next untap steps.";

export default defineCard({
  name: "Dragon Turtle",
  manaCost: "{1}{U}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Dragon", "Turtle"],
  power: 3,
  toughness: 5,
  keywords: ["flash"],
  text: `Flash\n${DRAG_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [{ kind: "optional", of: "creature-an-opponent-controls" }],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "tap", target: "source", doesntUntapNext: true },
          { kind: "tap", target: 0, doesntUntapNext: true },
        ],
      },
      resolve: null,
      text: DRAG_TEXT,
    },
  ],
});
