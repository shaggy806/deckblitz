import { defineCard } from "../define.js";

// EDHREC rank 23802. Turn to Frog's shape.
//
// Rulings:
//   [2016-01-22] If the affected creature gains an ability after Gift of Tusks resolves, it will
//     keep that ability.
//   [2016-01-22] The creature will lose all other colors and creature types, but it will retain
//     any other card types (such as artifact) or supertypes (such as legendary) it may have.
//   [2016-01-22] Gift of Tusks overwrites all previous effects that set the creature's base power
//     and toughness to specific values. Any power- or toughness-setting effects that start to
//     apply after Gift of Tusks resolves will overwrite this effect.

export default defineCard({
  name: "Gift of Tusks",
  manaCost: "{U}",
  colors: ["U"],
  types: ["instant"],
  text: "Until end of turn, target creature loses all abilities and becomes a green Elephant with base power and toughness 3/3.",
  targets: ["creature"],
  effect: {
    kind: "animate",
    target: 0,
    power: 3,
    toughness: 3,
    addTypes: ["creature"],
    addSubtypes: [],
    setSubtypes: ["Elephant"],
    setColors: ["G"],
    loseAbilities: true,
    duration: "end-of-turn",
  },
});
