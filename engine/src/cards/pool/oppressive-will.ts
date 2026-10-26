import { defineCard } from "../define.js";

// Saviors of Kamigawa (SOK). EDHREC rank 24366. Rakshasa's Disdain's shape, counting the
// caster's hand as it resolves.

export default defineCard({
  name: "Oppressive Will",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["instant"],
  text: "Counter target spell unless its controller pays {1} for each card in your hand.",
  targets: ["spell"],
  effect: {
    kind: "unless",
    chooser: 0,
    options: [{ payGeneric: { cardsInHand: "you" }, text: "Pay {X}." }],
    otherwise: { kind: "counter", target: 0 },
  },
});
