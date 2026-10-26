import { defineCard } from "../define.js";

// EDHREC rank 19328.
//
// Clash (rule 701.30): "that player" is the opponent clashed with.

export default defineCard({
  name: "Pollen Lullaby",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["instant"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "prevent-all-combat-damage" },
      { kind: "clash", won: { kind: "skip-next-untap", filter: { type: "creature" }, who: "that-player" } },
    ],
  },
  text: "Prevent all combat damage that would be dealt this turn. Clash with an opponent. If you win, creatures that player controls don't untap during the player's next untap step. (Each clashing player reveals the top card of their library, then puts that card on their choice of the top or bottom. A player wins if their card had a greater mana value.)",
});
