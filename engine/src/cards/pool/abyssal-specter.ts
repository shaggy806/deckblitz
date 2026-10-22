import { defineCard } from "../define.js";

// Ice Age. "Deals damage to a player" is any damage, combat or not — the
// `deals-damage` trigger with `to: "player"` (Hypnotic Specter's shape, minus
// "at random"): the discarding player chooses the card.

const TEXT = "Whenever this creature deals damage to a player, that player discards a card.";

export default defineCard({
  name: "Abyssal Specter",
  manaCost: "{2}{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Specter"],
  power: 2,
  toughness: 3,
  keywords: ["flying"],
  text: `Flying\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "deals-damage", who: "self", to: "player" },
      targets: [],
      effect: { kind: "discard", target: "trigger-player", amount: 1 },
      resolve: null,
      text: TEXT,
    },
  ],
});
