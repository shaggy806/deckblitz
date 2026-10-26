import { defineCard } from "../define.js";

// Eventide (EVE). EDHREC rank 18031.

const TEXT = "Whenever this creature deals combat damage to a player, that player discards that many cards.";

export default defineCard({
  name: "Needle Specter",
  manaCost: "{1}{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Specter"],
  power: 1,
  toughness: 1,
  keywords: ["flying", "wither"],
  text: `Flying\nWither (This deals damage to creatures in the form of -1/-1 counters.)\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "deals-combat-damage-to-player", who: "self" },
      targets: [],
      effect: { kind: "discard", target: "trigger-player", amount: { triggerValue: true } },
      resolve: null,
      text: TEXT,
    },
  ],
});
