import { defineCard } from "../define.js";

const ENTER_TEXT = "When this artifact enters, return two lands you control to their owner's hand.";

export default defineCard({
  name: "Khalni Gem",
  manaCost: "{4}",
  colors: [],
  types: ["artifact"],
  text: `${ENTER_TEXT}\n{T}: Add two mana of any one color.`,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "add-mana", mana: "any-color", amount: 2 },
      resolve: null,
      text: "{T}: Add two mana of any one color.",
    },
  ],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      // Two, or as many as you control (the ruling) — the choice clamps
      // `min` to what's eligible.
      effect: {
        kind: "choose-permanents",
        filter: { type: "land", controlledBy: "you" },
        upTo: 2,
        min: 2,
        then: { kind: "return-to-hand", target: 0 },
        prompt: "Return two lands you control to their owner's hand",
      },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
});
