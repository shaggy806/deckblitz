import { defineCard } from "../define.js";

// The Hobbit (HOB). EDHREC rank 7779.
//
// "Then if you control four or more Treasures" counts the one just made, as
// the chapter resolves; "sacrifice this Saga. If you do" makes the Dragon only
// if the Saga was still there to sacrifice (`sacrifice-source`'s `then`).

const CHAPTER_TEXT =
  "I, II, III, IV — Create a Treasure token. Then if you control four or more Treasures, sacrifice this Saga. If you do, create a 6/6 red Dragon creature token with flying.";

export default defineCard({
  name: "The Misty Mountains Cold",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["enchantment"],
  subtypes: ["Saga"],
  text:
    "(As this Saga enters and after your draw step, add a lore counter. Sacrifice after IV.)\n" +
    `${CHAPTER_TEXT} (A Treasure token is an artifact with "{T}, Sacrifice this token: Add one mana of any color.")`,
  chapters: [
    {
      at: [1, 2, 3, 4],
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "create-token", token: "Treasure Token", count: 1 },
          {
            kind: "conditional",
            condition: { kind: "controls", filter: { subtype: "Treasure" }, atLeast: 4 },
            then: {
              kind: "sacrifice-source",
              then: { kind: "create-token", token: "6/6 Dragon Token", count: 1 },
            },
          },
        ],
      },
      resolve: null,
      text: CHAPTER_TEXT,
    },
  ],
});
