import { defineCard } from "../define.js";

// Once per attacking player per combat (the ruling): `attacks-player` fires
// once for the enchanted player however many creatures attack them.
const ATTACK_TEXT =
  "Whenever a player attacks enchanted player with one or more creatures, that attacking player may discard a card. If the player does, they draw a card.";

export default defineCard({
  name: "Curse of Chaos",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["enchantment"],
  subtypes: ["Aura", "Curse"],
  text: `Enchant player\n${ATTACK_TEXT}`,
  targets: ["player"],
  triggered: [
    {
      trigger: { on: "attacks-player", who: "any", defender: "attached" },
      targets: [],
      effect: {
        kind: "each-player-may",
        who: "active-player",
        options: [{ discard: 1, text: "Discard a card" }],
        ifDid: { kind: "draw", amount: 1, who: "that-player" },
      },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
});
