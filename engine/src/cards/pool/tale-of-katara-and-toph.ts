import { defineCard } from "../define.js";

const GRANTED = "Whenever this creature becomes tapped for the first time during each of your turns, put a +1/+1 counter on it.";
const TEXT = `Creatures you control have "${GRANTED}"`;

export default defineCard({
  name: "Tale of Katara and Toph",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["enchantment"],
  text: TEXT,
  static: [
    {
      affects: { scope: "creatures-you-control" },
      grantsTriggered: [
        {
          trigger: { on: "becomes-tapped", who: "self", firstTimeEachTurn: true },
          condition: { kind: "your-turn" },
          targets: [],
          effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
          resolve: null,
          text: GRANTED,
        },
      ],
      text: TEXT,
    },
  ],
});
