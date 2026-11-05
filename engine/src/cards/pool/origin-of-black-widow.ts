import { defineCard } from "../define.js";

const ONE = "I — Each opponent sacrifices a creature of their choice.";
const TWO = "II — Creatures you control gain deathtouch until end of turn.";
const THREE = "III — Each opponent loses 1 life for each creature card in their graveyard.";

export default defineCard({
  name: "Origin of Black Widow",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["enchantment"],
  subtypes: ["Saga"],
  text: `(As this Saga enters and after your draw step, add a lore counter. Sacrifice after III.)\n${ONE}\n${TWO}\n${THREE}`,
  chapters: [
    {
      at: [1],
      targets: [],
      effect: { kind: "sacrifice", who: "each-opponent", filter: { type: "creature" }, count: 1 },
      resolve: null,
      text: ONE,
    },
    {
      at: [2],
      targets: [],
      effect: {
        kind: "grant-keyword-all",
        filter: { type: "creature", controlledBy: "you" },
        keyword: "deathtouch",
        duration: "end-of-turn",
      },
      resolve: null,
      text: TWO,
    },
    {
      at: [3],
      targets: [],
      effect: {
        kind: "lose-life",
        who: "each-opponent",
        amount: { countInGraveyard: { type: "creature", ownedBy: "you" }, forEachPlayer: true },
      },
      resolve: null,
      text: THREE,
    },
  ],
});
