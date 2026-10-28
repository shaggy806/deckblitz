import { defineCard } from "../define.js";

// EDHREC rank 19130.

const CHAPTER_I =
  "I — Gain control of up to two target creatures with total mana value 6 or less for as long as this Saga remains on the battlefield.";
const CHAPTER_II = "II — Creatures you control get +1/+1 and gain vigilance until end of turn.";
const CHAPTER_III = "III — Target creature you control fights up to one other target creature.";

export default defineCard({
  name: "The Super Hero Civil War",
  manaCost: "{3}{R}{W}",
  colors: ["W", "R"],
  types: ["enchantment"],
  subtypes: ["Saga"],
  text: `(As this Saga enters and after your draw step, add a lore counter. Sacrifice after III.)\n${CHAPTER_I}\n${CHAPTER_II}\n${CHAPTER_III}`,
  chapters: [
    {
      at: [1],
      targets: [{ kind: "any-number", of: "creature", max: 2, maxTotalManaValue: 6 }],
      effect: {
        kind: "for-each-target",
        from: 0,
        effect: { kind: "gain-control", target: 0, untilEndOfTurn: false, whileSource: true },
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
          {
            kind: "modify-pt-all",
            filter: { type: "creature", controlledBy: "you" },
            power: 1,
            toughness: 1,
            duration: "end-of-turn",
          },
          {
            kind: "grant-keyword-all",
            filter: { type: "creature", controlledBy: "you" },
            keyword: "vigilance",
            duration: "end-of-turn",
          },
        ],
      },
      resolve: null,
      text: CHAPTER_II,
    },
    {
      at: [3],
      targets: ["creature-you-control", { kind: "optional", of: { kind: "other", of: "creature", than: { slot: 0 } } }],
      effect: { kind: "fight", a: 0, b: 1 },
      resolve: null,
      text: CHAPTER_III,
    },
  ],
});
