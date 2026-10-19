import { defineCard } from "../define.js";

// EDHREC rank 28801.

const TEXT = "Wind Walk — {8}: Up to two target creatures each get +2/+2 and gain flying until end of turn.";

export default defineCard({
  name: "Bane's Invoker",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Cleric"],
  power: 2,
  toughness: 2,
  text: TEXT,
  activated: [
    {
      cost: { mana: "{8}", tap: false },
      targets: [
        { kind: "optional", of: "creature" },
        { kind: "optional", of: { kind: "other", of: "creature", than: { slots: [0] } } },
      ],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "modify-pt", target: 0, power: 2, toughness: 2, duration: "end-of-turn" },
          { kind: "grant-keyword", target: 0, keyword: "flying", duration: "end-of-turn" },
          { kind: "modify-pt", target: 1, power: 2, toughness: 2, duration: "end-of-turn" },
          { kind: "grant-keyword", target: 1, keyword: "flying", duration: "end-of-turn" },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
