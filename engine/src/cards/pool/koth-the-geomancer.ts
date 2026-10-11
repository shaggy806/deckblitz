import { defineCard } from "../define.js";

export default defineCard({
  name: "Koth, the Geomancer",
  manaCost: "{2}{R}",
  colors: ["R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Warrior"],
  power: 3,
  toughness: 2,
  keywords: ["reach"],
  text: "Reach\nLandfall — Whenever a land you control enters, Koth deals 1 damage to each opponent. If that land is a Mountain, add {R}.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "you-control", filter: { type: "land" } },
      targets: [],
      // "If that land is a Mountain" asks about the land that fired the
      // trigger (Akoum Hellkite's `trigger-object` condition).
      effect: {
        kind: "sequence",
        effects: [
          { kind: "damage", amount: 1, who: "each-opponent" },
          {
            kind: "conditional",
            condition: { kind: "trigger-object", filter: { subtype: "Mountain" } },
            then: { kind: "add-mana", mana: "R", amount: 1 },
          },
        ],
      },
      resolve: null,
      text: "Landfall — Whenever a land you control enters, Koth deals 1 damage to each opponent. If that land is a Mountain, add {R}.",
    },
  ],
});
