import { defineCard } from "../define.js";

const ATTACK_TEXT = "Whenever Thraximundar attacks, defending player sacrifices a creature of their choice.";
const SAC_TEXT = "Whenever a player sacrifices a creature, you may put a +1/+1 counter on Thraximundar.";

export default defineCard({
  name: "Thraximundar",
  manaCost: "{4}{U}{B}{R}",
  colors: ["U", "B", "R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Zombie", "Assassin"],
  power: 6,
  toughness: 6,
  keywords: ["haste"],
  text: `Haste\n${ATTACK_TEXT}\n${SAC_TEXT}`,
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: { kind: "sacrifice", who: "trigger-player", filter: { type: "creature" }, count: 1 },
      resolve: null,
      text: ATTACK_TEXT,
    },
    {
      trigger: { on: "sacrifice", who: "any", filter: { type: "creature" } },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Put a +1/+1 counter on Thraximundar?",
        effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
      },
      resolve: null,
      text: SAC_TEXT,
    },
  ],
});
