import { defineCard } from "../define.js";

// Its colors and card types stay. The mana ability comes with the loss, so it
// isn't lost (rule 613.7).
const ETB = "When this Aura enters, tap enchanted creature and remove all counters from it.";
const TEXT =
  'Enchanted creature loses all abilities and is a Citizen with base power and toughness 1/1 and "{T}: Add {C}" named Humble Merchant. (It loses all other creature types and names.)';

export default defineCard({
  name: "Honest Work",
  manaCost: "{U}",
  colors: ["U"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant creature an opponent controls\n${ETB}\n${TEXT}`,
  targets: ["creature-an-opponent-controls"],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "tap", target: "attached" },
          { kind: "remove-counter", target: "attached", counter: "any", amount: "all" },
        ],
      },
      resolve: null,
      text: ETB,
    },
  ],
  static: [
    {
      affects: { scope: "attached" },
      loseAllAbilities: true,
      setSubtypes: ["Citizen"],
      setBasePt: { power: 1, toughness: 1 },
      grantsActivated: [
        {
          cost: { mana: null, tap: true },
          targets: [],
          effect: { kind: "add-mana", mana: "C", amount: 1 },
          resolve: null,
          text: "{T}: Add {C}.",
        },
      ],
      setName: "Humble Merchant",
      text: TEXT,
    },
  ],
});
