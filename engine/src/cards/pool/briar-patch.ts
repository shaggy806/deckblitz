import { defineCard } from "../define.js";

// Mercadian Masques (MMQ). EDHREC rank 25123. Barbed Foliage's "attacks you"
// trigger (the player, not a planeswalker — rule 508.3a).

const TEXT = "Whenever a creature attacks you, it gets -1/-0 until end of turn.";

export default defineCard({
  name: "Briar Patch",
  manaCost: "{1}{G}{G}",
  colors: ["G"],
  types: ["enchantment"],
  text: TEXT,
  triggered: [
    {
      trigger: { on: "attacks", who: "any", attackingYou: true, defender: "player", filter: { type: "creature" } },
      targets: [],
      effect: { kind: "modify-pt", target: "trigger-object", power: -1, toughness: 0, duration: "end-of-turn" },
      resolve: null,
      text: TEXT,
    },
  ],
});
