import { defineCard } from "../define.js";

// Conspiracy. EDHREC rank 23912.
//
// Its draft abilities do nothing here: no game on this engine is drafted, so
// no card was ever revealed or exchanged for it. Its loot works as printed.

export default defineCard({
  name: "Deal Broker",
  manaCost: "{3}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Construct"],
  power: 2,
  toughness: 3,
  text: "Draft this card face up.\nImmediately after the draft, you may reveal a card in your card pool. Each other player may offer you one card in their card pool in exchange. You may accept any one offer.\n{T}: Draw a card, then discard a card.",
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [{ kind: "draw", amount: 1 }, { kind: "discard", target: "you", amount: 1 }],
      },
      resolve: null,
      text: "{T}: Draw a card, then discard a card.",
    },
  ],
});
