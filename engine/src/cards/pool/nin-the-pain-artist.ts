import { defineCard } from "../define.js";

// EDHREC rank 11788. X cards however much damage was dealt, drawn before a
// lethal creature dies (its rulings).

const ABILITY = "{X}{U}{R}, {T}: Nin deals X damage to target creature. That creature's controller draws X cards.";

export default defineCard({
  name: "Nin, the Pain Artist",
  manaCost: "{U}{R}",
  colors: ["U", "R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Vedalken", "Wizard"],
  power: 1,
  toughness: 1,
  text: ABILITY,
  activated: [
    {
      cost: { mana: "{X}{U}{R}", tap: true },
      targets: ["creature"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "damage", amount: "x", target: 0 },
          { kind: "draw", who: { controllerOfTarget: 0 }, amount: "x" },
        ],
      },
      resolve: null,
      text: ABILITY,
    },
  ],
});
