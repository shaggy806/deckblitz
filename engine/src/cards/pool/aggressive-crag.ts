import { defineCard } from "../define.js";

// Playtest card. "Your combat step" is the beginning of combat on your turn.

export default defineCard({
  name: "Aggressive Crag",
  colors: [],
  types: ["land"],
  text: "At the beginning of your combat step, tap Aggressive Crag.\n{T}: Add {R} or {W}.",
  triggered: [
    {
      trigger: { on: "step-begins", step: "begin-combat", who: "you" },
      targets: [],
      effect: { kind: "tap", target: "source" },
      resolve: null,
      text: "At the beginning of your combat step, tap Aggressive Crag.",
    },
  ],
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "add-mana", mana: { oneOf: ["R", "W"] }, amount: 1 },
      resolve: null,
      text: "{T}: Add {R} or {W}.",
    },
  ],
});
