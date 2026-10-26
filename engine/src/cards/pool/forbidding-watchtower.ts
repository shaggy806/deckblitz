import { defineCard } from "../define.js";

// EDHREC rank 11246.
//
// Rulings:
//   [2009-10-01] Activating the ability that turns it into a creature while it's already a
//     creature will override any effects that set its power and/or toughness to a specific number.

export default defineCard({
  name: "Forbidding Watchtower",
  colors: [],
  types: ["land"],
  text: "This land enters tapped.\n{T}: Add {W}.\n{1}{W}: This land becomes a 1/5 white Soldier creature until end of turn. It's still a land.",
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "add-mana", mana: "W", amount: 1 },
      resolve: null,
      text: "{T}: Add {W}.",
    },
    {
      cost: { mana: "{1}{W}", tap: false },
      targets: [],
      effect: {
        kind: "animate",
        target: "source",
        power: 1,
        toughness: 5,
        addTypes: ["creature"],
        addSubtypes: ["Soldier"],
        setColors: ["W"],
        duration: "end-of-turn",
      },
      resolve: null,
      text: "{1}{W}: This land becomes a 1/5 white Soldier creature until end of turn. It's still a land.",
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", tapped: true },
      text: "This land enters tapped.",
    },
  ],
});
