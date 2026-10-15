import { defineCard } from "../define.js";

const END_TEXT =
  "At the beginning of your end step, you may tap two untapped creatures and/or Treasures you control. If you do, draw a card. Otherwise, sacrifice this enchantment.";

/** An untapped creature or Treasure you control — one that's both counts once. */
const TAPPABLE = {
  tapped: false,
  controlledBy: "you",
  anyOf: [{ type: "creature" }, { subtype: "Treasure" }],
} as const;

export default defineCard({
  name: "Rent Is Due",
  manaCost: "{W}",
  colors: ["W"],
  types: ["enchantment"],
  text: END_TEXT,
  triggered: [
    {
      trigger: { on: "step-begins", step: "end", who: "you" },
      targets: [],
      // Aziza's shape: offered only with two to tap; declining, or having
      // fewer than two, is the "otherwise".
      effect: {
        kind: "conditional",
        condition: { kind: "controls", filter: TAPPABLE, atLeast: 2 },
        then: {
          kind: "may",
          prompt: "Tap two untapped creatures and/or Treasures you control to draw a card?",
          effect: {
            kind: "choose-permanents",
            filter: TAPPABLE,
            min: 2,
            upTo: 2,
            then: { kind: "tap", target: 0 },
            prompt: "Tap two untapped creatures and/or Treasures you control",
          },
          then: { kind: "draw", amount: 1 },
          else: { kind: "sacrifice-source" },
        },
        else: { kind: "sacrifice-source" },
      },
      resolve: null,
      text: END_TEXT,
    },
  ],
});
