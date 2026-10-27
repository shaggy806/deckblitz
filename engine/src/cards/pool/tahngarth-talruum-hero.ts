import { defineCard } from "../define.js";

// Planeshift (PLS). EDHREC rank 21222.
//
// Predatory Urge's shape: Tahngarth's damage, then the creature's back.

const TEXT =
  "{1}{R}, {T}: Tahngarth deals damage equal to its power to target creature. That creature deals damage equal to its power to Tahngarth.";

export default defineCard({
  name: "Tahngarth, Talruum Hero",
  manaCost: "{3}{R}{R}",
  colors: ["R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Minotaur", "Warrior"],
  power: 4,
  toughness: 4,
  keywords: ["vigilance"],
  text: `Vigilance\n${TEXT}`,
  activated: [
    {
      cost: { mana: "{1}{R}", tap: true },
      targets: ["creature"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "damage", amount: { powerOf: "source" }, target: 0 },
          { kind: "fight", a: 0, b: "source", oneSided: true },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
