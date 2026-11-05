import { defineCard } from "../define.js";

const MANA = "{T}: Add one mana of any color.";
const DRAW = "{4}, {T}: Each player who controls a permanent named Bonder's Ornament draws a card.";

export default defineCard({
  name: "Bonder's Ornament",
  manaCost: "{3}",
  colors: [],
  types: ["artifact"],
  text: `${MANA}\n${DRAW}`,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "add-mana", mana: "any-color", amount: 1 },
      resolve: null,
      text: MANA,
    },
    {
      cost: { mana: "{4}", tap: true },
      targets: [],
      // One card a player, however many they control (the ruling).
      effect: {
        kind: "for-each-player",
        who: "each-player",
        whoIf: {
          kind: "of-player",
          player: "that-player",
          condition: { kind: "controls", filter: { hasName: "Bonder's Ornament" }, atLeast: 1 },
        },
        effect: { kind: "draw", amount: 1, who: "that-player" },
      },
      resolve: null,
      text: DRAW,
    },
  ],
});
