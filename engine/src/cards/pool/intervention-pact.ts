import { defineCard } from "../define.js";

const PREVENT =
  "The next time a source of your choice would deal damage to you this turn, prevent that damage. You gain life equal to the damage prevented this way.";
const UPKEEP = "At the beginning of your next upkeep, pay {1}{W}{W}. If you don't, you lose the game.";

// White by its color indicator (the ruling). The delayed trigger is set up
// whether or not any damage is ever prevented.
export default defineCard({
  name: "Intervention Pact",
  manaCost: "{0}",
  colors: ["W"],
  types: ["instant"],
  text: `${PREVENT}\n${UPKEEP}`,
  targets: [],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "prevent-damage-from-chosen-source", to: "you", amount: "next-time", gainLifePrevented: true },
      {
        kind: "delayed-trigger",
        at: "your-next-upkeep",
        effect: {
          kind: "unless",
          chooser: "you",
          options: [{ pay: "{1}{W}{W}", text: "Pay {1}{W}{W}." }],
          otherwise: { kind: "lose-game" },
        },
        text: UPKEEP,
      },
    ],
  },
});
