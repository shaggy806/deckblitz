import { defineCard } from "../define.js";

// EDHREC rank 14759. Marvel Super Heroes. Summon: Bahamut's "destroy up to
// one target nonland permanent"; IV makes a legendary token named Galactus.

const I_TEXT = "I — Destroy up to one target nonland permanent.";
const II_TEXT = "II, III — Each opponent loses 2 life.";
const IV_TEXT =
  'IV — Create Galactus, a legendary 16/16 black Elder Alien creature token with flying, trample, and "Whenever Galactus attacks, destroy target land."';

export default defineCard({
  name: "The Coming of Galactus",
  manaCost: "{2}{B}{B}{G}",
  colors: ["B", "G"],
  types: ["enchantment"],
  subtypes: ["Saga"],
  text:
    "(As this Saga enters and after your draw step, add a lore counter. Sacrifice after IV.)\n" +
    `${I_TEXT}\n${II_TEXT}\n${IV_TEXT}`,
  chapters: [
    {
      at: [1],
      targets: [{ kind: "optional", of: "nonland-permanent" }],
      effect: { kind: "destroy", target: 0 },
      resolve: null,
      text: I_TEXT,
    },
    {
      at: [2, 3],
      targets: [],
      effect: { kind: "lose-life", amount: 2, who: "each-opponent" },
      resolve: null,
      text: II_TEXT,
    },
    {
      at: [4],
      targets: [],
      effect: { kind: "create-token", token: "Galactus", count: 1 },
      resolve: null,
      text: IV_TEXT,
    },
  ],
});
