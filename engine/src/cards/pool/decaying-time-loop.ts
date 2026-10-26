import { defineCard } from "../define.js";

export default defineCard({
  name: "Decaying Time Loop",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["instant"],
  retrace: true,
  text: "Discard all the cards in your hand, then draw that many cards.\nRetrace (You may cast this card from your graveyard by discarding a land card in addition to paying its other costs.)",
  targets: [],
  effect: {
    kind: "sequence",
    effects: [{ kind: "discard-hand", who: "you" }, { kind: "draw", amount: { thisWay: "discarded" } }],
  },
});
