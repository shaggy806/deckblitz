import { defineCard } from "../define.js";

// Rulings:
//   [2023-09-01] Count the number of attacking creatures when Charging Hooligan's ability
//     resolves, including Charging Hooligan itself, to determine the increase to its power.
// Only the active player's creatures attack, so "if a Rat is attacking" is a Rat its controller
// has attacking as it resolves.

const TEXT =
  "Whenever this creature attacks, it gets +1/+0 until end of turn for each attacking creature. If a Rat is attacking, this creature gains trample until end of turn.";

export default defineCard({
  name: "Charging Hooligan",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Human", "Peasant"],
  power: 3,
  toughness: 3,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          {
            kind: "modify-pt",
            target: "source",
            power: { countOf: { type: "creature", attacking: true } },
            toughness: 0,
            duration: "end-of-turn",
          },
          {
            kind: "conditional",
            condition: { kind: "controls", filter: { subtype: "Rat", attacking: true }, atLeast: 1 },
            then: { kind: "grant-keyword", target: "source", keyword: "trample", duration: "end-of-turn" },
          },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
