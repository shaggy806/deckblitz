import { defineCard } from "../define.js";

// EDHREC rank 31609.
//
// Rulings:
//   [2008-08-01] It matters that an opponent controls a creature with flying only as you activate
//     this ability. Once you've activated it, Groundling Pouncer will still get +1/+3 and gain
//     flying, even if all of your opponents' creatures with flying leave the battlefield in
//     response to the ability or after the ability resolves.

export default defineCard({
  name: "Groundling Pouncer",
  manaCost: "{1}{G/U}",
  colors: ["U", "G"],
  types: ["creature"],
  subtypes: ["Faerie"],
  power: 2,
  toughness: 1,
  text: "{G/U}: This creature gets +1/+3 and gains flying until end of turn. Activate only once each turn and only if an opponent controls a creature with flying.",
  activated: [
    {
      cost: { mana: "{G/U}", tap: false },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "modify-pt", target: "source", power: 1, toughness: 3, duration: "end-of-turn" },
          { kind: "grant-keyword", target: "source", keyword: "flying", duration: "end-of-turn" },
        ],
      },
      resolve: null,
      oncePerTurn: true,
      condition: { kind: "opponent-controls", filter: { type: "creature", keyword: "flying" }, atLeast: 1 },
      text: "{G/U}: This creature gets +1/+3 and gains flying until end of turn. Activate only once each turn and only if an opponent controls a creature with flying.",
    },
  ],
});
