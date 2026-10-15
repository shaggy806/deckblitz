import { defineCard } from "../define.js";

// EDHREC rank 9971.

const ETB_TEXT =
  "When this creature enters, each opponent discards a card and loses 2 life. You draw a card and gain 2 life.";

export default defineCard({
  name: "Arbiter of Woe",
  manaCost: "{4}{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Demon"],
  power: 5,
  toughness: 4,
  keywords: ["flying"],
  text: `As an additional cost to cast this spell, sacrifice a creature.\nFlying\n${ETB_TEXT}`,
  additionalCost: { sacrifice: { type: "creature" } },
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "discard", target: "each-opponent", amount: 1 },
          { kind: "lose-life", amount: 2, who: "each-opponent" },
          { kind: "draw", amount: 1 },
          { kind: "gain-life", amount: 2 },
        ],
      },
      resolve: null,
      text: ETB_TEXT,
    },
  ],
});
