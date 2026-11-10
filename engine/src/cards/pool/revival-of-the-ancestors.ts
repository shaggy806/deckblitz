import { defineCard } from "../define.js";

// EDHREC rank 11659. Makes Spirits → use "Spirit Token (Great Arashin City)".
//
// Chapter II's three counters are split as the chapter ability is put on the
// stack (rule 603.3d), at least one to each of its one to three targets.
const CHAPTER_I = "I — Create three 1/1 white Spirit creature tokens.";
const CHAPTER_II = "II — Distribute three +1/+1 counters among one, two, or three target creatures you control.";
const CHAPTER_III = "III — Creatures you control gain trample and lifelink until end of turn.";

export default defineCard({
  name: "Revival of the Ancestors",
  manaCost: "{1}{W}{B}{G}",
  colors: ["W", "B", "G"],
  types: ["enchantment"],
  subtypes: ["Saga"],
  text: `(As this Saga enters and after your draw step, add a lore counter. Sacrifice after III.)\n${CHAPTER_I}\n${CHAPTER_II}\n${CHAPTER_III}`,
  chapters: [
    {
      at: [1],
      targets: [],
      effect: { kind: "create-token", token: "Spirit Token (Great Arashin City)", count: 3 },
      resolve: null,
      text: CHAPTER_I,
    },
    {
      at: [2],
      targets: [{ kind: "any-number", of: "creature-you-control", min: 1, max: 3 }],
      divided: { total: 3, slot: 0, of: "+1/+1 counters" },
      effect: { kind: "counters-divided", from: 0, counter: "+1/+1" },
      resolve: null,
      text: CHAPTER_II,
    },
    {
      at: [3],
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "grant-keyword-all", filter: { type: "creature", controlledBy: "you" }, keyword: "trample", duration: "end-of-turn" },
          { kind: "grant-keyword-all", filter: { type: "creature", controlledBy: "you" }, keyword: "lifelink", duration: "end-of-turn" },
        ],
      },
      resolve: null,
      text: CHAPTER_III,
    },
  ],
});
