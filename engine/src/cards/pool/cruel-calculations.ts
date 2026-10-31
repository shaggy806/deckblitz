import { defineCard } from "../define.js";

// From Ashes (FRA). EDHREC rank 20674. X counts the cards put into the
// target player's graveyard from their library this turn — milled,
// surveilled, any library-to-graveyard move — though they've left it since:
// the turn history's `to-graveyard` list, `from: ["library"]`.

export default defineCard({
  name: "Cruel Calculations",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["sorcery"],
  text: "Draw X cards, where X is the number of cards that were put into target player's graveyard from their library this turn.",
  targets: ["player"],
  effect: { kind: "draw", amount: { turnHistory: "to-graveyard", target: 0, from: ["library"] } },
});
