import { defineCard } from "../define.js";

// Prophecy. EDHREC rank 20157. Combat damage to a player is dealt to the
// defending player, so "defending player" is the player dealt the damage
// (Trygon Predator's optional destroy, on the enchanted creature).

const TEXT =
  "Whenever enchanted creature deals combat damage to defending player, you may destroy target artifact that player controls.";

export default defineCard({
  name: "Latulla's Orders",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  keywords: ["flash"],
  text: `Flash\nEnchant creature\n${TEXT}`,
  targets: ["creature"],
  triggered: [
    {
      trigger: { on: "deals-combat-damage-to-player", who: "attached" },
      targets: [{ kind: "permanent", whose: "trigger-player", filter: { type: "artifact" } }],
      effect: { kind: "may", prompt: "Destroy the target artifact?", effect: { kind: "destroy", target: 0 } },
      resolve: null,
      text: TEXT,
    },
  ],
});
