import { defineCard } from "../define.js";

// EDHREC rank 4568.
//
// Chapter I: the next opponent in turn order chooses first, each other opponent in turn, and the
// chosen creatures go back together (the ruling).

const CHAPTER_I =
  "I — Sonic Wings — Each opponent chooses a creature with the greatest mana value among creatures they control. Return those creatures to their owners' hands.";
const CHAPTER_II_TO_IV = "II, III, IV — Tap up to one target creature and put a stun counter on it.";

export default defineCard({
  name: "Summon: Valefor",
  manaCost: "{4}{U}",
  colors: ["U"],
  types: ["enchantment", "creature"],
  subtypes: ["Saga", "Drake"],
  power: 5,
  toughness: 4,
  keywords: ["flying"],
  text: `(As this Saga enters and after your draw step, add a lore counter. Sacrifice after IV.)\n${CHAPTER_I}\n${CHAPTER_II_TO_IV}\nFlying`,
  chapters: [
    {
      at: [1],
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          {
            kind: "vote",
            choose: true,
            who: "each-opponent",
            startingWith: "next-opponent",
            for: {
              permanent: {
                type: "creature",
                controlledBy: "you",
                greatestAmongItsController: { of: "mana-value", among: { type: "creature" } },
              },
              own: true,
            },
          },
          {
            kind: "for-each-voted",
            which: "voted",
            simultaneous: true,
            effect: { kind: "return-to-hand", target: 0 },
          },
        ],
      },
      resolve: null,
      text: CHAPTER_I,
    },
    {
      at: [2, 3, 4],
      targets: [{ kind: "optional", of: "creature" }],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "tap", target: 0 },
          { kind: "add-counter", target: 0, counter: "stun", amount: 1 },
        ],
      },
      resolve: null,
      text: CHAPTER_II_TO_IV,
    },
  ],
});
