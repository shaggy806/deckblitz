import { defineCard } from "../define.js";

// EDHREC rank 19289.
//
// Rulings:
//   [2013-04-15] Until the ability that turns the Keyrune into a creature resolves, the Keyrune is
//     colorless.
//   [2013-04-15] Activating the ability that turns the Keyrune into a creature while it's already
//     a creature will override any effects that set its power and/or toughness to another number,
//     but effects that modify power and/or toughness without directly setting them will still
//     apply.

export default defineCard({
  name: "Simic Keyrune",
  manaCost: "{3}",
  colors: [],
  types: ["artifact"],
  text: "{T}: Add {G} or {U}.\n{G}{U}: This artifact becomes a 2/3 green and blue Crab artifact creature with hexproof until end of turn. (It can't be the target of spells or abilities your opponents control.)",
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "add-mana", mana: { oneOf: ["G", "U"] }, amount: 1 },
      resolve: null,
      text: "{T}: Add {G} or {U}.",
    },
    {
      cost: { mana: "{G}{U}", tap: false },
      targets: [],
      effect: {
        kind: "animate",
        target: "source",
        power: 2,
        toughness: 3,
        addTypes: ["artifact", "creature"],
        addSubtypes: ["Crab"],
        setColors: ["G", "U"],
        keywords: ["hexproof"],
        duration: "end-of-turn",
      },
      resolve: null,
      text: "{G}{U}: This artifact becomes a 2/3 green and blue Crab artifact creature with hexproof until end of turn.",
    },
  ],
});
