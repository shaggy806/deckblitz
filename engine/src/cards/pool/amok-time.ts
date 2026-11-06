import { defineCard } from "../define.js";

// EDHREC rank 29580.

const CHAPTER_I = "I — Target creature you control fights up to one target creature an opponent controls.";
const CHAPTER_II = "II — You gain 3 life.";
const CHAPTER_III = "III — Return target creature card from your graveyard to your hand.";

export default defineCard({
  name: "Amok Time",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["enchantment"],
  subtypes: ["Saga"],
  text: `(As this Saga enters and after your draw step, add a lore counter. Sacrifice after III.)\n${CHAPTER_I}\n${CHAPTER_II}\n${CHAPTER_III}`,
  chapters: [
    {
      at: [1],
      targets: ["creature-you-control", { kind: "optional", of: "creature-an-opponent-controls" }],
      effect: { kind: "fight", a: 0, b: 1 },
      resolve: null,
      text: CHAPTER_I,
    },
    {
      at: [2],
      targets: [],
      effect: { kind: "gain-life", amount: 3 },
      resolve: null,
      text: CHAPTER_II,
    },
    {
      at: [3],
      targets: [{ kind: "card-in-graveyard", whose: "you", filter: { type: "creature" } }],
      effect: { kind: "return-to-hand", target: 0, from: "graveyard" },
      resolve: null,
      text: CHAPTER_III,
    },
  ],
});
