import { defineCard } from "../define.js";

const MODE1 = "Burn Down the House deals 5 damage to each creature and each planeswalker.";
const MODE2 =
  'Create three 1/1 red Devil creature tokens with "When this token dies, it deals 1 damage to any target." They gain haste until end of turn.';

export default defineCard({
  name: "Burn Down the House",
  manaCost: "{3}{R}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: `Choose one —\n• ${MODE1}\n• ${MODE2}`,
  castModal: {
    minModes: 1,
    maxModes: 1,
    modes: [
      {
        text: MODE1,
        effect: { kind: "damage-all", filter: { typesAnyOf: ["creature", "planeswalker"] }, amount: 5 },
      },
      {
        text: MODE2,
        effect: { kind: "create-token", token: "Devil Token", count: 3, gainUntilEndOfTurn: ["haste"] },
      },
    ],
  },
});
