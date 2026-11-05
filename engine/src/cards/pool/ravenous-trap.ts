import { defineCard } from "../define.js";

// One opponent's three, not three among them: read of each opponent in turn.
export default defineCard({
  name: "Ravenous Trap",
  manaCost: "{2}{B}{B}",
  colors: ["B"],
  types: ["instant"],
  subtypes: ["Trap"],
  text: "If an opponent had three or more cards put into their graveyard from anywhere this turn, you may pay {0} rather than pay this spell's mana cost.\nExile target player's graveyard.",
  alternativeCost: {
    mana: "{0}",
    condition: {
      kind: "of-player",
      player: "an-opponent",
      // A token isn't a card (rule 111.1).
      condition: { kind: "turn-history", what: "to-graveyard", atLeast: 3, filter: { token: false } },
    },
  },
  targets: ["player"],
  effect: { kind: "exile-graveyard", target: 0 },
});
