import { defineCard } from "../define.js";

// Guilds of Ravnica (GRN). EDHREC rank 6889.
//
// The mode is chosen as it's activated, with its own target (rule 700.2b —
// Cankerbloom's shape). The damage comes from the sacrificed creature as it
// last existed.
export default defineCard({
  name: "Goblin Cratermaker",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Goblin", "Warrior"],
  power: 2,
  toughness: 2,
  text: "{1}, Sacrifice this creature: Choose one —\n• This creature deals 2 damage to target creature.\n• Destroy target colorless nonland permanent.",
  activated: [
    {
      cost: { mana: "{1}", tap: false, sacrifice: "self" },
      targets: [],
      effect: {
        kind: "modal",
        announced: true,
        minModes: 1,
        maxModes: 1,
        modes: [
          {
            text: "This creature deals 2 damage to target creature.",
            targets: ["creature"],
            effect: { kind: "damage", amount: 2, target: 0 },
          },
          {
            text: "Destroy target colorless nonland permanent.",
            targets: [{ kind: "permanent", filter: { colorless: true, notTypes: ["land"] } }],
            effect: { kind: "destroy", target: 0 },
          },
        ],
      },
      resolve: null,
      text: "{1}, Sacrifice this creature: Choose one —\n• This creature deals 2 damage to target creature.\n• Destroy target colorless nonland permanent.",
    },
  ],
});
