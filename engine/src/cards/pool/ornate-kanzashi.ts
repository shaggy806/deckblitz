import { defineCard } from "../define.js";

// Betrayers of Kamigawa (BOK). EDHREC rank 26759. Knacksaw Clique's shape: the
// opponent's top card exiled face up, playable by you this turn only (with its
// costs paid and its normal timing), staying exiled once the turn ends.
const TEXT = "{2}, {T}: Target opponent exiles the top card of their library. You may play that card this turn.";

export default defineCard({
  name: "Ornate Kanzashi",
  manaCost: "{5}",
  colors: [],
  types: ["artifact"],
  text: TEXT,
  activated: [
    {
      cost: { mana: "{2}", tap: true },
      targets: ["opponent"],
      effect: { kind: "impulse-exile", amount: 1, duration: "end-of-turn", whose: 0 },
      resolve: null,
      text: TEXT,
    },
  ],
});
