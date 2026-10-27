import { defineCard } from "../define.js";

// EDHREC rank 7411. Chapter I's indestructible lasts for as long as you
// control this Saga — it ends when the Saga leaves (sacrificed after III) or
// changes hands.
const CHAPTER_I = "I — Target creature you control gains indestructible for as long as you control this Saga.";
const CHAPTER_II = "II — Return target creature card from your graveyard to the battlefield.";
const CHAPTER_III = "III — Up to two target creatures you control each gain lifelink until end of turn.";

export default defineCard({
  name: "Tale of Tinúviel",
  manaCost: "{3}{W}{W}",
  colors: ["W"],
  types: ["enchantment"],
  subtypes: ["Saga"],
  text: `(As this Saga enters and after your draw step, add a lore counter. Sacrifice after III.)\n${CHAPTER_I}\n${CHAPTER_II}\n${CHAPTER_III}`,
  chapters: [
    {
      at: [1],
      targets: ["creature-you-control"],
      effect: { kind: "grant-keyword", target: 0, keyword: "indestructible", duration: "while-you-control-source" },
      resolve: null,
      text: CHAPTER_I,
    },
    {
      at: [2],
      targets: [{ kind: "card-in-graveyard", whose: "you", filter: { type: "creature" } }],
      effect: { kind: "put-onto-battlefield", target: 0 },
      resolve: null,
      text: CHAPTER_II,
    },
    {
      at: [3],
      targets: [{ kind: "any-number", of: "creature-you-control", min: 0, max: 2 }],
      effect: {
        kind: "for-each-target",
        from: 0,
        effect: { kind: "grant-keyword", target: 0, keyword: "lifelink", duration: "end-of-turn" },
      },
      resolve: null,
      text: CHAPTER_III,
    },
  ],
});
