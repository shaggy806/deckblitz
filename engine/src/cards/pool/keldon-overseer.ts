import { defineCard } from "../define.js";

// EDHREC rank 25108. Dominaria.
//
// Rulings:
//   [2018-04-27] You can target and gain control of an untapped creature with Keldon Overseer's
//     ability. You can also untap a creature you already control and give it haste.
//
// Act of Treason's effect, behind the kicked enters trigger.

const TEXT =
  "When this creature enters, if it was kicked, gain control of target creature until end of turn. Untap that creature. It gains haste until end of turn.";

export default defineCard({
  name: "Keldon Overseer",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Human", "Warrior"],
  power: 3,
  toughness: 1,
  keywords: ["haste"],
  kicker: { cost: "{3}{R}" },
  text: `Kicker {3}{R} (You may pay an additional {3}{R} as you cast this spell.)\nHaste\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      condition: { kind: "self-kicked" },
      targets: ["creature"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "gain-control", target: 0, untilEndOfTurn: true },
          { kind: "untap", target: 0 },
          { kind: "grant-keyword", target: 0, keyword: "haste", duration: "end-of-turn" },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
