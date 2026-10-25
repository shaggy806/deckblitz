import { defineCard } from "../define.js";

// EDHREC rank 15378.
//
// The granted ability's "this creature" is the equipped creature. "If a
// colorless creature is dealt damage this way" — Ballista Wielder's
// damage-dealt-this-way gate: prevented damage taps nothing.
const GRANTED_TEXT =
  "{2}, {T}: This creature deals 1 damage to target creature. If a colorless creature is dealt damage this way, tap it.";

export default defineCard({
  name: "Pathway Arrows",
  manaCost: "{1}",
  colors: [],
  types: ["artifact"],
  subtypes: ["Equipment"],
  text: `Equipped creature has "${GRANTED_TEXT}"\nEquip {2}`,
  static: [
    {
      affects: { scope: "attached" },
      grantsActivated: [
        {
          cost: { mana: "{2}", tap: true },
          targets: ["creature"],
          effect: {
            kind: "sequence",
            effects: [
              { kind: "damage", amount: 1, target: 0 },
              {
                kind: "conditional",
                condition: {
                  kind: "all",
                  of: [
                    { kind: "damage-dealt-this-way", to: 0 },
                    { kind: "target", index: 0, filter: { type: "creature", colorless: true } },
                  ],
                },
                then: { kind: "tap", target: 0 },
              },
            ],
          },
          resolve: null,
          text: GRANTED_TEXT,
        },
      ],
      text: `Equipped creature has "${GRANTED_TEXT}"`,
    },
  ],
  activated: [
    {
      cost: { mana: "{2}", tap: false },
      targets: ["creature-you-control"],
      effect: { kind: "attach", target: 0 },
      resolve: null,
      text: "Equip {2}",
      sorcerySpeed: true,
    },
  ],
});
