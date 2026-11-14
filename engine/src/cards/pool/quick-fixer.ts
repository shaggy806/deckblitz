import { defineCard } from "../define.js";

const DAMAGE =
  "Whenever this creature deals combat damage to a player, open an Attraction. (Put the top card of your Attraction deck onto the battlefield.)";

export default defineCard({
  name: "Quick Fixer",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Azra", "Employee"],
  power: 2,
  toughness: 3,
  keywords: ["menace"],
  text: `Menace\n${DAMAGE}`,
  triggered: [
    {
      trigger: { on: "deals-combat-damage-to-player", who: "self" },
      targets: [],
      effect: { kind: "open-attraction" },
      resolve: null,
      text: DAMAGE,
    },
  ],
});
