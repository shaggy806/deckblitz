import { defineCard } from "../define.js";

// EDHREC rank 28400.

const TEXT =
  "Hellbent — Whenever this creature deals combat damage to a player, if you have no cards in hand, that player discards a card at random.";

export default defineCard({
  name: "Headless Specter",
  manaCost: "{1}{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Specter"],
  power: 2,
  toughness: 2,
  keywords: ["flying"],
  text: `Flying\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "deals-combat-damage-to-player", who: "self" },
      condition: { kind: "hand-size", atMost: 0 },
      targets: [],
      effect: { kind: "discard", target: "trigger-player", amount: 1, random: true },
      resolve: null,
      text: TEXT,
    },
  ],
});
