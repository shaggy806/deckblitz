import { defineCard } from "../define.js";

// EDHREC rank 16448.
//
// Rulings:
//   [2013-04-15] Until the ability that turns the Keyrune into a creature resolves, the Keyrune is
//     colorless.
//   [2013-04-15] Activating the ability that turns the Keyrune into a creature while it's already
//     a creature will override any effects that set its power and/or toughness to another number,
//     but effects that modify power and/or toughness without directly setting them will still
//     apply.
//
// Ojutai Monument's shape.

export default defineCard({
  name: "Golgari Keyrune",
  manaCost: "{3}",
  colors: [],
  types: ["artifact"],
  text: "{T}: Add {B} or {G}.\n{B}{G}: This artifact becomes a 2/2 black and green Insect artifact creature with deathtouch until end of turn.",
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "add-mana", mana: { oneOf: ["B", "G"] }, amount: 1 },
      resolve: null,
      text: "{T}: Add {B} or {G}.",
    },
    {
      cost: { mana: "{B}{G}", tap: false },
      targets: [],
      effect: {
        kind: "animate",
        target: "source",
        power: 2,
        toughness: 2,
        addTypes: ["creature"],
        addSubtypes: ["Insect"],
        setColors: ["B", "G"],
        keywords: ["deathtouch"],
        duration: "end-of-turn",
      },
      resolve: null,
      text: "{B}{G}: This artifact becomes a 2/2 black and green Insect artifact creature with deathtouch until end of turn.",
    },
  ],
});
