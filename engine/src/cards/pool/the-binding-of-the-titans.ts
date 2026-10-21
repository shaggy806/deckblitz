import { defineCard } from "../define.js";

const CHAPTER_I = "I — Each player mills three cards.";
const CHAPTER_II =
  "II — Exile up to two target cards from graveyards. For each creature card exiled this way, you gain 1 life.";
const CHAPTER_III = "III — Return target creature or land card from your graveyard to your hand.";

export default defineCard({
  name: "The Binding of the Titans",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["enchantment"],
  subtypes: ["Saga"],
  text: `(As this Saga enters and after your draw step, add a lore counter. Sacrifice after III.)\n${CHAPTER_I}\n${CHAPTER_II}\n${CHAPTER_III}`,
  chapters: [
    {
      at: [1],
      targets: [],
      effect: { kind: "mill", target: "each-player", amount: 3 },
      resolve: null,
      text: CHAPTER_I,
    },
    {
      at: [2],
      targets: [{ kind: "any-number", of: { kind: "card-in-graveyard", whose: "any" }, max: 2 }],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "for-each-target", from: 0, effect: { kind: "exile", target: 0 }, simultaneous: true },
          { kind: "gain-life", amount: { thisWay: "exiled", filter: { type: "creature" } } },
        ],
      },
      resolve: null,
      text: CHAPTER_II,
    },
    {
      at: [3],
      targets: [{ kind: "card-in-graveyard", whose: "you", filter: { typesAnyOf: ["creature", "land"] } }],
      effect: { kind: "return-to-hand", target: 0, from: "graveyard" },
      resolve: null,
      text: CHAPTER_III,
    },
  ],
});
