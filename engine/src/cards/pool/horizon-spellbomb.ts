import { defineCard } from "../define.js";

// EDHREC rank 20627. The draw trigger goes on the stack above the search, so
// it resolves first (the ruling).
export default defineCard({
  name: "Horizon Spellbomb",
  manaCost: "{1}",
  colors: [],
  types: ["artifact"],
  text:
    "{2}, {T}, Sacrifice this artifact: Search your library for a basic land card, reveal it, put it into your hand, then shuffle.\n" +
    "When this artifact is put into a graveyard from the battlefield, you may pay {G}. If you do, draw a card.",
  activated: [
    {
      cost: { mana: "{2}", tap: true, sacrifice: "self" },
      targets: [],
      effect: {
        kind: "search-library",
        filter: { supertype: "basic", type: "land" },
        destination: "hand",
        min: 0,
        max: 1,
        reveal: true,
      },
      resolve: null,
      text: "{2}, {T}, Sacrifice this artifact: Search your library for a basic land card, reveal it, put it into your hand, then shuffle.",
    },
  ],
  triggered: [
    {
      trigger: { on: "dies", who: "self" },
      targets: [],
      effect: { kind: "may", prompt: "Pay {G} to draw a card?", cost: "{G}", effect: { kind: "draw", amount: 1 } },
      resolve: null,
      text: "When this artifact is put into a graveyard from the battlefield, you may pay {G}. If you do, draw a card.",
    },
  ],
});
