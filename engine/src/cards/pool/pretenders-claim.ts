import { defineCard } from "../define.js";

const TEXT = "Whenever enchanted creature becomes blocked, tap all lands defending player controls.";

export default defineCard({
  name: "Pretender's Claim",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant creature\n${TEXT}`,
  targets: ["creature"],
  triggered: [
    {
      trigger: { on: "becomes-blocked", who: "attached" },
      targets: [],
      effect: { kind: "tap-all", filter: { type: "land", controlledByRef: { defendingPlayerOf: "trigger-object" } } },
      resolve: null,
      text: TEXT,
    },
  ],
});
