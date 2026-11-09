import { defineCard } from "../define.js";

const CHAPTER_I = "I — Create two tapped Powerstone tokens.";
const CHAPTER_II =
  "II — Choose two target players. Until your next turn, each creature they control attacks the other chosen player each combat if able.";
const CHAPTER_III =
  "III — This Saga deals X damage to any target and X damage to any other target, where X is the number of artifacts you control.";

const X = { countOf: { type: "artifact", controlledBy: "you" } } as const;

export default defineCard({
  name: "The Brothers' War",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["enchantment"],
  subtypes: ["Saga"],
  text: `(As this Saga enters and after your draw step, add a lore counter. Sacrifice after III.)\n${CHAPTER_I}\n${CHAPTER_II}\n${CHAPTER_III}`,
  chapters: [
    {
      at: [1],
      targets: [],
      effect: { kind: "create-token", token: "Powerstone Token", count: 2, tapped: true },
      resolve: null,
      text: CHAPTER_I,
    },
    {
      at: [2],
      targets: ["player", { kind: "other", of: "player", than: { slots: [0] } }],
      effect: {
        kind: "sequence",
        effects: [
          {
            kind: "restrict",
            filter: { type: "creature", controlledByRef: { target: 0 } },
            restrictions: [{ kind: "must-attack", at: { target: 1 } }],
            duration: "until-your-next-turn",
          },
          {
            kind: "restrict",
            filter: { type: "creature", controlledByRef: { target: 1 } },
            restrictions: [{ kind: "must-attack", at: { target: 0 } }],
            duration: "until-your-next-turn",
          },
        ],
      },
      resolve: null,
      text: CHAPTER_II,
    },
    {
      at: [3],
      targets: ["any-target", { kind: "other", of: "any-target", than: { slots: [0] } }],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "damage", amount: X, target: 0 },
          { kind: "damage", amount: X, target: 1 },
        ],
      },
      resolve: null,
      text: CHAPTER_III,
    },
  ],
});
