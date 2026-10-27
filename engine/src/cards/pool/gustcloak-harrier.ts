import { defineCard } from "../define.js";

// Onslaught. EDHREC rank 27352. Gustcloak Cavalier's blocked trigger.

const BLOCKED = "Whenever this creature becomes blocked, you may untap it and remove it from combat.";

export default defineCard({
  name: "Gustcloak Harrier",
  manaCost: "{1}{W}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Bird", "Soldier"],
  power: 2,
  toughness: 2,
  keywords: ["flying"],
  text: `Flying\n${BLOCKED}`,
  triggered: [
    {
      trigger: { on: "becomes-blocked", who: "self" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Untap Gustcloak Harrier and remove it from combat?",
        effect: {
          kind: "sequence",
          effects: [
            { kind: "untap", target: "source" },
            { kind: "remove-from-combat", target: "source" },
          ],
        },
      },
      resolve: null,
      text: BLOCKED,
    },
  ],
});
