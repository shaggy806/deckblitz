import { defineCard } from "../define.js";

// EDHREC rank 12481.
//
// Rulings:
//   [2013-04-15] Activating the ability that turns the Keyrune into a creature while it's already
//     a creature will override any effects that set its power and/or toughness to another number,
//     but effects that modify power and/or toughness without directly setting them will still
//     apply.
//   [2013-04-15] Until the ability that turns the Keyrune into a creature resolves, the Keyrune is
//     colorless.
//
// Ojutai Monument's shape.

export default defineCard({
  name: "Azorius Keyrune",
  manaCost: "{3}",
  colors: [],
  types: ["artifact"],
  text: "{T}: Add {W} or {U}.\n{W}{U}: This artifact becomes a 2/2 white and blue Bird artifact creature with flying until end of turn.",
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "add-mana", mana: { oneOf: ["W", "U"] }, amount: 1 },
      resolve: null,
      text: "{T}: Add {W} or {U}.",
    },
    {
      cost: { mana: "{W}{U}", tap: false },
      targets: [],
      effect: {
        kind: "animate",
        target: "source",
        power: 2,
        toughness: 2,
        addTypes: ["creature"],
        addSubtypes: ["Bird"],
        setColors: ["W", "U"],
        keywords: ["flying"],
        duration: "end-of-turn",
      },
      resolve: null,
      text: "{W}{U}: This artifact becomes a 2/2 white and blue Bird artifact creature with flying until end of turn.",
    },
  ],
});
