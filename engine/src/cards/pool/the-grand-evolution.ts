import { defineCard } from "../define.js";

// The back face of Vorinclex.
//
// Rulings:
//   [2023-04-14] The set of creatures that gain the activated fight ability is determined as the
//     chapter III ability resolves. Notably, Vorinclex won't be back on the battlefield yet, so
//     it won't gain that ability.
//
// - Chapter I's creature cards are found wherever the milled cards went (rule
//   701.17c): `look-and-choose` over the graveyard with `thisWay: "milled"`.
// - Chapter II's seven counters are split as the chapter ability is put on
//   the stack (rule 603.3d), at least one to each target; "any number" may be
//   none, and then nothing is distributed.
// - Chapter III grants the fight ability before the Saga is exiled, so the
//   returning Vorinclex isn't among the creatures that gain it (rule 611.2c).
const CHAPTER_I = "I — Mill ten cards. Put up to two creature cards from among the milled cards onto the battlefield.";
const CHAPTER_II = "II — Distribute seven +1/+1 counters among any number of target creatures you control.";
const FIGHT_TEXT = "{1}: This creature fights target creature you don't control.";
const CHAPTER_III =
  `III — Until end of turn, creatures you control gain "${FIGHT_TEXT}" ` +
  "Exile this Saga, then return it to the battlefield (front face up).";

export default defineCard({
  name: "The Grand Evolution",
  art: "https://cards.scryfall.io/art_crop/back/e/2/e24b5289-d3b5-4b4d-bb37-69bf2c3b48bc.jpg",
  colors: ["G"],
  types: ["enchantment"],
  subtypes: ["Saga"],
  text: `(As this Saga enters and after your draw step, add a lore counter.)\n${CHAPTER_I}\n${CHAPTER_II}\n${CHAPTER_III}`,
  faces: ["Vorinclex", "The Grand Evolution"],
  transform: true,
  chapters: [
    {
      at: [1],
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "mill", target: "you", amount: 10 },
          {
            kind: "look-and-choose",
            zone: "graveyard",
            min: 0,
            max: 2,
            destination: "battlefield",
            leftover: "stay",
            filter: { thisWay: "milled", type: "creature" },
          },
        ],
      },
      resolve: null,
      text: CHAPTER_I,
    },
    {
      at: [2],
      targets: [{ kind: "any-number", of: "creature-you-control", min: 0, max: 7 }],
      divided: { total: 7, slot: 0, of: "+1/+1 counters" },
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
          {
            kind: "grant-activated-all",
            filter: { type: "creature", controlledBy: "you" },
            ability: {
              cost: { mana: "{1}", tap: false },
              targets: ["creature-an-opponent-controls"],
              effect: { kind: "fight", a: "source", b: 0 },
              resolve: null,
              text: FIGHT_TEXT,
            },
            duration: "end-of-turn",
          },
          { kind: "flicker", target: "source" },
        ],
      },
      resolve: null,
      text: CHAPTER_III,
    },
  ],
});
