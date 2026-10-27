import { defineCard } from "../define.js";

const ONE = "{T}: This creature deals 1 damage to target creature.";
const TWO = "{T}: This creature deals 2 damage to target creature.";
const TEXT_ONE = `Enchanted creature has "${ONE}"`;
const TEXT_TWO = `As long as enchanted creature is a Wizard, it has "${TWO}"`;

export default defineCard({
  name: "Lavamancer's Skill",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant creature\n${TEXT_ONE}\n${TEXT_TWO}`,
  targets: ["creature"],
  static: [
    {
      affects: { scope: "attached" },
      grantsActivated: [
        {
          cost: { mana: null, tap: true },
          targets: ["creature"],
          effect: { kind: "damage", amount: 1, target: 0 },
          resolve: null,
          text: ONE,
        },
      ],
      text: TEXT_ONE,
    },
    // A Wizard has both abilities (the ruling).
    {
      affects: { scope: "attached" },
      condition: { kind: "source", filter: { attachedTo: { subtype: "Wizard" } } },
      grantsActivated: [
        {
          cost: { mana: null, tap: true },
          targets: ["creature"],
          effect: { kind: "damage", amount: 2, target: 0 },
          resolve: null,
          text: TWO,
        },
      ],
      text: TEXT_TWO,
    },
  ],
});
