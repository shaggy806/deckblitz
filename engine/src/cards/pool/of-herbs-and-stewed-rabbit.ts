import { defineCard } from "../define.js";

// EDHREC rank 4696.
//
// Chapter I: "up to one target creature" is an optional slot, so the Food
// comes even with no target; a target chosen and then illegal makes the
// chapter do nothing at all (its ruling, rule 608.2b). Chapter III counts
// every Food, token or not (its ruling).

const CHAPTER_I = "I — Put a +1/+1 counter on up to one target creature. Create a Food token.";
const CHAPTER_II = "II — Draw a card. Create a Food token.";
const CHAPTER_III = "III — Create a 1/1 white Halfling creature token for each Food you control.";

export default defineCard({
  name: "Of Herbs and Stewed Rabbit",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["enchantment"],
  subtypes: ["Saga"],
  text: `(As this Saga enters and after your draw step, add a lore counter. Sacrifice after III.)\n${CHAPTER_I}\n${CHAPTER_II}\n${CHAPTER_III}`,
  chapters: [
    {
      at: [1],
      targets: [{ kind: "optional", of: "creature" }],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 },
          { kind: "create-token", token: "Food Token", count: 1 },
        ],
      },
      resolve: null,
      text: CHAPTER_I,
    },
    {
      at: [2],
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "draw", amount: 1 },
          { kind: "create-token", token: "Food Token", count: 1 },
        ],
      },
      resolve: null,
      text: CHAPTER_II,
    },
    {
      at: [3],
      targets: [],
      effect: {
        kind: "create-token",
        token: "Halfling Token",
        count: { countOf: { subtype: "Food", controlledBy: "you" } },
      },
      resolve: null,
      text: CHAPTER_III,
    },
  ],
});
