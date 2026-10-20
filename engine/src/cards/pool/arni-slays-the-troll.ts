import { defineCard } from "../define.js";

// Kaldheim (KHM). EDHREC rank 9785.
//
// II isn't a mana ability (its ruling): it uses the stack, and with a target chosen that has
// gone illegal it doesn't resolve, so no {R} either.
const CHAPTER_I = "I — Target creature you control fights up to one target creature you don't control.";
const CHAPTER_II = "II — Add {R}. Put two +1/+1 counters on up to one target creature you control.";
const CHAPTER_III = "III — You gain life equal to the greatest power among creatures you control.";

export default defineCard({
  name: "Arni Slays the Troll",
  manaCost: "{R}{G}",
  colors: ["R", "G"],
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
      targets: [{ kind: "optional", of: "creature-you-control" }],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "add-mana", mana: "R", amount: 1 },
          { kind: "add-counter", target: 0, counter: "+1/+1", amount: 2 },
        ],
      },
      resolve: null,
      text: CHAPTER_II,
    },
    {
      at: [3],
      targets: [],
      effect: {
        kind: "gain-life",
        amount: { aggregate: "max", of: "power", filter: { type: "creature", controlledBy: "you" } },
      },
      resolve: null,
      text: CHAPTER_III,
    },
  ],
});
