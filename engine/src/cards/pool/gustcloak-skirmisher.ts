import { defineCard } from "../define.js";

// Onslaught (ONS). EDHREC rank 28843.

const TEXT = "Whenever this creature becomes blocked, you may untap it and remove it from combat.";

export default defineCard({
  name: "Gustcloak Skirmisher",
  manaCost: "{3}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Bird", "Soldier"],
  power: 2,
  toughness: 3,
  keywords: ["flying"],
  text: `Flying\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "becomes-blocked", who: "self" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Untap Gustcloak Skirmisher and remove it from combat?",
        effect: {
          kind: "sequence",
          effects: [
            { kind: "untap", target: "source" },
            { kind: "remove-from-combat", target: "source" },
          ],
        },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
