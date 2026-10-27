import { defineCard } from "../define.js";

const TEXT = "Whenever a creature you control becomes blocked, you may untap that creature and remove it from combat.";

export default defineCard({
  name: "Gustcloak Savior",
  manaCost: "{4}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Bird", "Soldier"],
  power: 3,
  toughness: 4,
  keywords: ["flying"],
  text: `Flying\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "becomes-blocked", who: "you-control", filter: { type: "creature" } },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Untap that creature and remove it from combat?",
        effect: {
          kind: "sequence",
          effects: [
            { kind: "untap", target: "trigger-object" },
            { kind: "remove-from-combat", target: "trigger-object" },
          ],
        },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
