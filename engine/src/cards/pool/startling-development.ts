import { defineCard } from "../define.js";

// EDHREC rank 21616. Ikoria: Lair of Behemoths.
//
// Rulings:
//   [2020-04-17] Startling Development overwrites all previous effects that set the affected
//     creatures' color, creature types, power, and/or toughness to specific values.
//   [2020-04-17] The affected creature doesn't lose any abilities when it becomes a Serpent.
//
// Serpentine Ambush's shape: Serpent replaces its creature types (rule
// 205.1b), blue its colours, 4/4 its base P/T, until end of turn.

export default defineCard({
  name: "Startling Development",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["instant"],
  cycling: { cost: "{1}" },
  text: "Until end of turn, target creature becomes a blue Serpent with base power and toughness 4/4.\nCycling {1} ({1}, Discard this card: Draw a card.)",
  targets: ["creature"],
  effect: {
    kind: "animate",
    target: 0,
    power: 4,
    toughness: 4,
    addTypes: ["creature"],
    addSubtypes: [],
    setSubtypes: ["Serpent"],
    setColors: ["U"],
    duration: "end-of-turn",
  },
});
