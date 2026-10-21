import { defineCard } from "../define.js";

const TEXT =
  "Whenever you cycle a card, you may have this enchantment become a copy of another target permanent until your next turn, except it has this ability.";

export default defineCard({
  name: "Crystalline Resonance",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["enchantment"],
  text: TEXT,
  triggered: [
    {
      trigger: { on: "cycles", who: "you" },
      targets: [{ kind: "other", of: "permanent" }],
      effect: {
        kind: "may",
        prompt: "Have Crystalline Resonance become a copy of another target permanent until your next turn, except it has this ability?",
        effect: {
          kind: "become-copy",
          target: "source",
          of: 0,
          until: "your-next-turn",
          exceptions: { thisAbility: { card: "Crystalline Resonance", triggered: 0 } },
        },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
