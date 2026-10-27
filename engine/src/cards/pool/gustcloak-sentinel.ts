import { defineCard } from "../define.js";

// Onslaught. EDHREC rank 29995. Gustcloak Cavalier's blocked trigger.

const TEXT = "Whenever this creature becomes blocked, you may untap it and remove it from combat.";

export default defineCard({
  name: "Gustcloak Sentinel",
  manaCost: "{2}{W}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Soldier"],
  power: 3,
  toughness: 3,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "becomes-blocked", who: "self" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Untap Gustcloak Sentinel and remove it from combat?",
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
