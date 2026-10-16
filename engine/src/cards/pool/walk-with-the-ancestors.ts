import { defineCard } from "../define.js";

export default defineCard({
  name: "Walk with the Ancestors",
  manaCost: "{4}{G}",
  colors: ["G"],
  types: ["sorcery"],
  text: "Return up to one target permanent card from your graveyard to your hand. Discover 4. (Exile cards from the top of your library until you exile a nonland card with mana value 4 or less. Cast it without paying its mana cost or put it into your hand. Put the rest on the bottom in a random order.)",
  targets: [{ kind: "optional", of: { kind: "card-in-graveyard", whose: "you", filter: { notTypes: ["instant", "sorcery"] } } }],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "return-to-hand", target: 0, from: "graveyard" },
      { kind: "discover", amount: 4 },
    ],
  },
});
