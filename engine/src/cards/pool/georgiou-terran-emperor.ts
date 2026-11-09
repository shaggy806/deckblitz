import { defineCard } from "../define.js";

const STATIC_TEXT = "You don't lose the game for having 0 or less life.";
const END_TEXT = "At the beginning of your end step, you lose 3 life and draw a card. Then if your life total is 0 or less, create ten 1/1 red Officer creature tokens.";

export default defineCard({
  name: "Georgiou, Terran Emperor",
  manaCost: "{4}{B}{B}",
  colors: ["B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Rogue", "Noble"],
  power: 4,
  toughness: 6,
  text: `${STATIC_TEXT}\n${END_TEXT}`,
  static: [{ affects: { scope: "self" }, prohibits: [{ act: "lose-game", who: "you", only: "zero-life" }], text: STATIC_TEXT }],
  triggered: [
    {
      trigger: { on: "step-begins", step: "end", who: "you" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "lose-life", amount: 3 },
          { kind: "draw", amount: 1 },
          {
            kind: "conditional",
            condition: { kind: "life-total", atMost: 0 },
            then: { kind: "create-token", token: "Officer Token", count: 10 },
          },
        ],
      },
      resolve: null,
      text: END_TEXT,
    },
  ],
});
