import { defineCard } from "../define.js";

const DRAW_TEXT = "When this artifact enters, draw a card.";
const DART_TEXT = "{T}, Sacrifice this artifact: Target creature doesn't untap during its controller's next untap step.";

export default defineCard({
  name: "Sleeper Dart",
  manaCost: "{2}",
  colors: [],
  types: ["artifact"],
  text: `${DRAW_TEXT}\n${DART_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "draw", amount: 1 },
      resolve: null,
      text: DRAW_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: null, tap: true, sacrifice: "self" },
      targets: ["creature"],
      effect: { kind: "tap", target: 0, doesntUntapNext: true, onlyDoesntUntap: true },
      resolve: null,
      text: DART_TEXT,
    },
  ],
});
