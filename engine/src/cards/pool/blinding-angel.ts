import { defineCard } from "../define.js";

const TEXT = "Whenever this creature deals combat damage to a player, that player skips their next combat phase.";

export default defineCard({
  name: "Blinding Angel",
  manaCost: "{3}{W}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Angel"],
  power: 2,
  toughness: 4,
  keywords: ["flying"],
  text: `Flying (This creature can't be blocked except by creatures with flying or reach.)\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "deals-combat-damage-to-player", who: "self" },
      targets: [],
      effect: { kind: "skip-step", step: "combat", who: "trigger-player" },
      resolve: null,
      text: TEXT,
    },
  ],
});
