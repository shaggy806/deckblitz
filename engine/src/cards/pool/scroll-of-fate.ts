import { defineCard } from "../define.js";

// Any card from the hand: a land or a sorcery manifests as well as a creature,
// and only a creature card can be turned face up for its mana cost (701.40g).
const TEXT =
  "{T}: Manifest a card from your hand. (Put that card onto the battlefield face down as a 2/2 creature. Turn it face up any time for its mana cost if it's a creature card.)";

export default defineCard({
  name: "Scroll of Fate",
  manaCost: "{3}",
  colors: [],
  types: ["artifact"],
  text: TEXT,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "look-and-choose", zone: "hand", min: 1, max: 1, destination: "manifest", leftover: "stay" },
      resolve: null,
      text: TEXT,
    },
  ],
});
