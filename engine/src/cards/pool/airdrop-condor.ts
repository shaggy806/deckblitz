import { defineCard } from "../define.js";

// Onslaught (ONS). EDHREC rank 29725.

const TEXT =
  "{1}{R}, Sacrifice a Goblin creature: This creature deals damage equal to the sacrificed creature's power to any target.";

export default defineCard({
  name: "Airdrop Condor",
  manaCost: "{4}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Bird"],
  power: 2,
  toughness: 2,
  keywords: ["flying"],
  text: `Flying\n${TEXT}`,
  activated: [
    {
      cost: {
        mana: "{1}{R}",
        tap: false,
        sacrifice: { filter: { type: "creature", subtype: "Goblin", controlledBy: "you" } },
      },
      targets: ["any-target"],
      effect: { kind: "damage", amount: { powerOf: "sacrificed" }, target: 0 },
      resolve: null,
      text: TEXT,
    },
  ],
});
