import { defineCard } from "../define.js";

// EDHREC rank 20192. Gift of Tusks' shape, then a draw.
//
// Rulings:
//   [2008-08-01] If the affected creature gains an ability after Snakeform resolves, it will keep
//     that ability.
//   [2008-08-01] The power/toughness-setting effect overwrites other effects that set power and
//     toughness only if those effects existed before this spell resolved.

export default defineCard({
  name: "Snakeform",
  manaCost: "{2}{G/U}",
  colors: ["U", "G"],
  types: ["instant"],
  text: "Until end of turn, target creature loses all abilities and becomes a green Snake with base power and toughness 1/1.\nDraw a card.",
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [
      {
        kind: "animate",
        target: 0,
        power: 1,
        toughness: 1,
        addTypes: ["creature"],
        addSubtypes: [],
        setSubtypes: ["Snake"],
        setColors: ["G"],
        loseAbilities: true,
        duration: "end-of-turn",
      },
      { kind: "draw", amount: 1 },
    ],
  },
});
