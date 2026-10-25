import { defineCard } from "../define.js";

const GRANTED =
  "{T}: This creature deals damage equal to its power to target creature. That creature deals damage equal to its power to this creature.";

export default defineCard({
  name: "Predatory Urge",
  manaCost: "{3}{G}",
  colors: ["G"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant creature\nEnchanted creature has "${GRANTED}"`,
  targets: ["creature"],
  static: [
    {
      affects: { scope: "attached" },
      grantsActivated: [
        {
          cost: { mana: null, tap: true },
          // Any creature, itself included (the ruling: it's then dealt
          // damage twice).
          targets: ["creature"],
          effect: {
            kind: "sequence",
            effects: [
              { kind: "damage", amount: { powerOf: "source" }, target: 0 },
              { kind: "fight", a: 0, b: "source", oneSided: true },
            ],
          },
          resolve: null,
          text: GRANTED,
        },
      ],
      text: `Enchanted creature has "${GRANTED}"`,
    },
  ],
});
