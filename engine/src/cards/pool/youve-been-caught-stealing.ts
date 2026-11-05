import { defineCard } from "../define.js";

const THREATEN = "Threaten the Merchant — Each creature blocks this turn if able.";
const BRIBE = "Bribe the Guards — You create a Treasure token for each opponent who was dealt damage this turn.";

export default defineCard({
  name: "You've Been Caught Stealing",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: `Choose one —\n• ${THREATEN}\n• ${BRIBE} (It's an artifact with "{T}, Sacrifice this token: Add one mana of any color.")`,
  castModal: {
    minModes: 1,
    maxModes: 1,
    modes: [
      { text: THREATEN, effect: { kind: "block-if-able", filter: { type: "creature" } } },
      {
        text: BRIBE,
        effect: {
          kind: "create-token",
          token: "Treasure Token",
          count: { playersWithTurnStat: "damage-taken", who: "each-opponent" },
        },
      },
    ],
  },
});
