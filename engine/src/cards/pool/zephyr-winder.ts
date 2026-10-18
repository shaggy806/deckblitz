import { defineCard } from "../define.js";

// EDHREC rank 25304.

const TEXT = "Whenever this creature deals combat damage to a player, untap up to one target creature.";

export default defineCard({
  name: "Zephyr Winder",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Elemental"],
  power: 2,
  toughness: 1,
  keywords: ["flying"],
  text: `Flying\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "deals-combat-damage-to-player", who: "self" },
      targets: [{ kind: "optional", of: "creature" }],
      effect: { kind: "untap", target: 0 },
      resolve: null,
      text: TEXT,
    },
  ],
});
