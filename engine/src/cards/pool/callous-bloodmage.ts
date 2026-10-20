import { defineCard } from "../define.js";

const PEST_MODE =
  "Create a 1/1 black and green Pest creature token with \"When this token dies, you gain 1 life.\"";
const DRAW_MODE = "You draw a card and you lose 1 life.";
const EXILE_MODE = "Exile target player's graveyard.";
const ENTER_TEXT = `When this creature enters, choose one —\n• ${PEST_MODE}\n• ${DRAW_MODE}\n• ${EXILE_MODE}`;

export default defineCard({
  name: "Callous Bloodmage",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Vampire", "Warlock"],
  power: 2,
  toughness: 1,
  text: ENTER_TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "modal",
        announced: true,
        minModes: 1,
        maxModes: 1,
        modes: [
          { text: PEST_MODE, effect: { kind: "create-token", token: "Pest Token", count: 1 } },
          {
            text: DRAW_MODE,
            effect: {
              kind: "sequence",
              effects: [
                { kind: "draw", amount: 1 },
                { kind: "lose-life", amount: 1 },
              ],
            },
          },
          { text: EXILE_MODE, targets: ["player"], effect: { kind: "exile-graveyard", target: 0 } },
        ],
      },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
});
