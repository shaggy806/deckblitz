import { defineCard } from "../define.js";
import { distinctTargets } from "../helpers.js";

export default defineCard({
  name: "Daring Discovery",
  manaCost: "{4}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: "Up to three target creatures can't block this turn.\nDiscover 4. (Exile cards from the top of your library until you exile a nonland card with mana value 4 or less. Cast it without paying its mana cost or put it into your hand. Put the rest on the bottom in a random order.)",
  targets: distinctTargets(3, "creature", { optional: true }),
  effect: {
    kind: "sequence",
    effects: [
      { kind: "restrict", target: 0, restrictions: ["cant-block"] },
      { kind: "restrict", target: 1, restrictions: ["cant-block"] },
      { kind: "restrict", target: 2, restrictions: ["cant-block"] },
      { kind: "discover", amount: 4 },
    ],
  },
});
