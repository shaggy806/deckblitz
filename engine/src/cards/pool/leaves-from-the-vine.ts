import { defineCard } from "../define.js";
import { distinctTargets } from "../helpers.js";

// EDHREC rank 12779. Chapter III's "if" is read as it resolves.

const CHAPTER_I =
  "I — Mill three cards, then create a Food token. (It's an artifact with \"{2}, {T}, Sacrifice this token: You gain 3 life.\")";
const CHAPTER_II = "II — Put a +1/+1 counter on each of up to two target creatures you control.";
const CHAPTER_III = "III — Draw a card if there's a creature or Lesson card in your graveyard.";

export default defineCard({
  name: "Leaves from the Vine",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["enchantment"],
  subtypes: ["Saga"],
  text: `(As this Saga enters and after your draw step, add a lore counter. Sacrifice after III.)\n${CHAPTER_I}\n${CHAPTER_II}\n${CHAPTER_III}`,
  chapters: [
    {
      at: [1],
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "mill", target: "you", amount: 3 },
          { kind: "create-token", token: "Food Token", count: 1 },
        ],
      },
      resolve: null,
      text: CHAPTER_I,
    },
    {
      at: [2],
      targets: distinctTargets(2, "creature-you-control", { optional: true }),
      effect: {
        kind: "sequence",
        effects: [
          { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 },
          { kind: "add-counter", target: 1, counter: "+1/+1", amount: 1 },
        ],
      },
      resolve: null,
      text: CHAPTER_II,
    },
    {
      at: [3],
      targets: [],
      effect: {
        kind: "conditional",
        condition: {
          kind: "cards-in-graveyard",
          atLeast: 1,
          filter: { anyOf: [{ type: "creature" }, { subtype: "Lesson" }] },
        },
        then: { kind: "draw", amount: 1 },
      },
      resolve: null,
      text: CHAPTER_III,
    },
  ],
});
