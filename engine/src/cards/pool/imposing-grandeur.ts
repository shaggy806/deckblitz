import { defineCard } from "../define.js";

// Each player's own commanders, as they answer.
export default defineCard({
  name: "Imposing Grandeur",
  manaCost: "{4}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: "Each player may discard their hand and draw cards equal to the greatest mana value of a commander they own on the battlefield or in the command zone.",
  targets: [],
  effect: {
    kind: "each-player-may",
    who: "each-player",
    prompt: "Discard your hand and draw cards equal to your commander's mana value?",
    effect: {
      kind: "sequence",
      effects: [
        { kind: "discard-hand", who: "you" },
        { kind: "draw", amount: { greatestCommanderManaValue: true, onBattlefieldOrInCommandZone: true } },
      ],
    },
  },
});
