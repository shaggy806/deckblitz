import { defineCard } from "../define.js";

const CHAPTER_I = "I — Exile target artifact, enchantment, or tapped creature an opponent controls.";
const CHAPTER_II_III =
  "II, III — Until your next turn, creatures can't attack you unless their controller pays {2} for each of those creatures.";
const CHAPTER_IV =
  "IV — Create X Treasure tokens, where X is the number of opponents who control a creature with power 4 or greater.";

export default defineCard({
  name: "Summon: Yojimbo",
  manaCost: "{3}{W}",
  colors: ["W"],
  types: ["enchantment", "creature"],
  subtypes: ["Saga", "Samurai"],
  power: 5,
  toughness: 5,
  keywords: ["vigilance"],
  text: `(As this Saga enters and after your draw step, add a lore counter. Sacrifice after IV.)\n${CHAPTER_I}\n${CHAPTER_II_III}\n${CHAPTER_IV}\nVigilance`,
  chapters: [
    {
      at: [1],
      targets: [
        {
          kind: "permanent",
          whose: "opponent",
          filter: { anyOf: [{ type: "artifact" }, { type: "enchantment" }, { type: "creature", tapped: true }] },
        },
      ],
      effect: { kind: "exile", target: 0 },
      resolve: null,
      text: CHAPTER_I,
    },
    {
      at: [2, 3],
      targets: [],
      // You only — not planeswalkers you control.
      effect: { kind: "player-effect", duration: "until-your-next-turn", attackTax: { generic: 2, covers: "you" } },
      resolve: null,
      text: CHAPTER_II_III,
    },
    {
      at: [4],
      targets: [],
      effect: {
        kind: "create-token",
        token: "Treasure Token",
        count: {
          countPlayers: "each-opponent",
          where: {
            kind: "of-player",
            player: "that-player",
            condition: {
              kind: "controls",
              filter: { type: "creature", power: { op: "gte", n: 4 } },
              atLeast: 1,
            },
          },
        },
      },
      resolve: null,
      text: CHAPTER_IV,
    },
  ],
});
