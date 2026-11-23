import { defineCard } from "../define.js";

// Playtest card. The land trigger watches every graveyard, any owner's.

export default defineCard({
  name: "Tragda, the Burner",
  manaCost: "{4}{R}{R}{R}",
  colors: ["R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Dragon", "Human"],
  power: 6,
  toughness: 6,
  keywords: ["flying"],
  text: "Flying\nWhenever a land card is put into a graveyard from anywhere, put two +1/+1 counters on Tragda.\nWhenever Tragda attacks, choose one—\n• Burn the village — Destroy target land.\n• Burn the peasants — Tragda deals 4 damage to target creature.",
  triggered: [
    {
      trigger: { on: "put-into-graveyard", who: "any", filter: { type: "land" } },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 2 },
      resolve: null,
      text: "Whenever a land card is put into a graveyard from anywhere, put two +1/+1 counters on Tragda.",
    },
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: {
        kind: "modal",
        announced: true,
        minModes: 1,
        maxModes: 1,
        modes: [
          {
            text: "Burn the village — Destroy target land.",
            targets: ["land"],
            effect: { kind: "destroy", target: 0 },
          },
          {
            text: "Burn the peasants — Tragda deals 4 damage to target creature.",
            targets: ["creature"],
            effect: { kind: "damage", amount: 4, target: 0 },
          },
        ],
      },
      resolve: null,
      text: "Whenever Tragda attacks, choose one—\n• Burn the village — Destroy target land.\n• Burn the peasants — Tragda deals 4 damage to target creature.",
    },
  ],
});
