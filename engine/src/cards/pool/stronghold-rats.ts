import { defineCard } from "../define.js";

// EDHREC rank 7669.

export default defineCard({
  name: "Stronghold Rats",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Rat"],
  power: 2,
  toughness: 1,
  keywords: ["shadow"],
  text: "Shadow (This creature can block or be blocked by only creatures with shadow.)\nWhenever this creature deals combat damage to a player, each player discards a card.",
  triggered: [
    {
      trigger: { on: "deals-combat-damage-to-player", who: "self" },
      targets: [],
      // Each player chooses a card face down, then all are discarded at once (the ruling, rule 101.4).
      effect: { kind: "discard", target: "each-player", amount: 1 },
      resolve: null,
      text: "Whenever this creature deals combat damage to a player, each player discards a card.",
    },
  ],
});
