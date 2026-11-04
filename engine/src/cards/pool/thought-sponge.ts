import { defineCard } from "../define.js";

const ENTER_TEXT = "This creature enters with a number of +1/+1 counters on it equal to the greatest number of cards an opponent has drawn this turn.";
const DIES_TEXT = "When this creature dies, draw cards equal to its power.";

export default defineCard({
  name: "Thought Sponge",
  manaCost: "{3}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Sponge"],
  power: 1,
  toughness: 1,
  keywords: ["flash"],
  text: `Flash\n${ENTER_TEXT}\n${DIES_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      replacement: {
        event: "enters-battlefield",
        counters: {
          kind: "+1/+1",
          amount: {
            greatestAmongPlayers: { turnStat: "cards-drawn", who: "each" },
            who: "each-opponent",
            includingLeft: true,
          },
        },
      },
      text: ENTER_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "dies", who: "self" },
      targets: [],
      effect: { kind: "draw", amount: { powerOf: "source" } },
      resolve: null,
      text: DIES_TEXT,
    },
  ],
});
