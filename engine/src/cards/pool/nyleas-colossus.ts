import { defineCard } from "../define.js";
import { thisOrAnother } from "../helpers.js";

// EDHREC rank 7433.
//
// Rulings:
//   Doubling gives +X/+X where X is its power (toughness) as the effect begins
//   to apply; a negative power is doubled to more negative (`doubling`).

const TEXT =
  "Constellation — Whenever this creature or another enchantment you control enters, double target creature's power and toughness until end of turn.";

// It's an enchantment creature, so one enchantment filter covers both halves
// (Eidolon of Blossoms).
export default defineCard({
  name: "Nylea's Colossus",
  manaCost: "{6}{G}",
  colors: ["G"],
  types: ["enchantment", "creature"],
  subtypes: ["Giant"],
  power: 6,
  toughness: 6,
  text: TEXT,
  triggered: [
    ...thisOrAnother({
      trigger: { on: "enters-battlefield", who: "you-control", filter: { type: "enchantment" } },
      targets: ["creature"],
      effect: {
        kind: "modify-pt",
        target: 0,
        power: { powerOf: 0, doubling: true },
        toughness: { toughnessOf: 0, doubling: true },
        duration: "end-of-turn",
      },
      resolve: null,
      text: TEXT,
    }),
  ],
});
