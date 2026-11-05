import { defineCard } from "../define.js";

const CHAPTER_I = "I — Scry 2.";
const CHAPTER_II =
  "II — Draw a card. Then you may reveal a Giant card from your hand. When you do, this Saga deals 2 damage to target opponent or planeswalker.";
const CHAPTER_III = "III — The next Giant spell you cast this turn costs {2} less to cast.";

/** Chapter II reveals after the draw, then a reflexive ability targets — so
 * players can respond after the reveal (its ruling). */
export default defineCard({
  name: "Invasion of the Giants",
  manaCost: "{U}{R}",
  colors: ["U", "R"],
  types: ["enchantment"],
  subtypes: ["Saga"],
  text: `(As this Saga enters and after your draw step, add a lore counter. Sacrifice after III.)\n${CHAPTER_I}\n${CHAPTER_II}\n${CHAPTER_III}`,
  chapters: [
    { at: [1], targets: [], effect: { kind: "scry", amount: 2 }, resolve: null, text: CHAPTER_I },
    {
      at: [2],
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "draw", amount: 1 },
          {
            kind: "look-and-choose",
            zone: "hand",
            min: 0,
            max: 1,
            filter: { subtype: "Giant" },
            destination: "reveal",
            leftover: "stay",
          },
          {
            kind: "conditional",
            condition: { kind: "this-way", what: "revealed", atLeast: 1 },
            then: {
              kind: "reflexive-trigger",
              targets: ["opponent-or-planeswalker"],
              effect: { kind: "damage", amount: 2, target: 0 },
              text: "When you do, this Saga deals 2 damage to target opponent or planeswalker.",
            },
          },
        ],
      },
      resolve: null,
      text: CHAPTER_II,
    },
    {
      at: [3],
      targets: [],
      effect: { kind: "grant-spells-this-turn", next: true, filter: { subtype: "Giant" }, reduceGeneric: 2 },
      resolve: null,
      text: CHAPTER_III,
    },
  ],
});
