import { defineCard } from "../define.js";

const TEXT = "Whenever this creature becomes blocked, you may untap it and remove it from combat.";

export default defineCard({
  name: "Gustcloak Runner",
  manaCost: "{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Soldier"],
  power: 1,
  toughness: 1,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "becomes-blocked", who: "self" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Untap Gustcloak Runner and remove it from combat?",
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
