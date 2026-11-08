import { defineCard } from "../define.js";

// "During that player's next turn": for each opponent, a player effect that
// waits for their next turn (`{ duringTurnOf: "that-player" }`) and lasts
// through it.
export default defineCard({
  name: "Sphinx's Decree",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["sorcery"],
  text: "Each opponent can't cast instant or sorcery spells during that player's next turn.",
  targets: [],
  effect: {
    kind: "for-each-player",
    who: "each-opponent",
    effect: {
      kind: "player-effect",
      duration: { duringTurnOf: "that-player" },
      cantCast: { who: "that-player", filter: { typesAnyOf: ["instant", "sorcery"] }, label: "instant or sorcery spells" },
    },
  },
});
