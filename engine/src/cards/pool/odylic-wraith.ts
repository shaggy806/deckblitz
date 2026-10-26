import { defineCard } from "../define.js";

const TEXT = "Whenever this creature deals damage to a player, that player discards a card.";

export default defineCard({
  name: "Odylic Wraith",
  manaCost: "{3}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Wraith"],
  power: 2,
  toughness: 2,
  keywords: ["swampwalk"],
  text: `Swampwalk (This creature can't be blocked as long as defending player controls a Swamp.)\n${TEXT}`,
  triggered: [
    {
      // Any damage, not only combat damage (the ruling).
      trigger: { on: "deals-damage", who: "self", to: "player" },
      targets: [],
      effect: { kind: "discard", target: "trigger-player", amount: 1 },
      resolve: null,
      text: TEXT,
    },
  ],
});
