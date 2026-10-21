import { defineCard } from "../define.js";

// X is the Saga's lore counters as each chapter resolves (its ruling), read
// once by `modify-pt` and fixed for the turn.

const CHAPTER_I_III =
  "I, II, III — Until end of turn, target creature gains trample and gets +X/+0, where X is the number of lore counters on this Saga.";
const CHAPTER_IV = "IV — Target creature you control fights up to one target creature you don't control.";

export default defineCard({
  name: "The Triumph of Anax",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["enchantment"],
  subtypes: ["Saga"],
  text: `(As this Saga enters and after your draw step, add a lore counter. Sacrifice after IV.)\n${CHAPTER_I_III}\n${CHAPTER_IV} (Each deals damage equal to its power to the other.)`,
  chapters: [
    {
      at: [1, 2, 3],
      targets: ["creature"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "grant-keyword", target: 0, keyword: "trample", duration: "end-of-turn" },
          {
            kind: "modify-pt",
            target: 0,
            power: { countersOn: "source", counter: "lore" },
            toughness: 0,
            duration: "end-of-turn",
          },
        ],
      },
      resolve: null,
      text: CHAPTER_I_III,
    },
    {
      at: [4],
      targets: ["creature-you-control", { kind: "optional", of: "creature-an-opponent-controls" }],
      effect: { kind: "fight", a: 0, b: 1 },
      resolve: null,
      text: CHAPTER_IV,
    },
  ],
});
