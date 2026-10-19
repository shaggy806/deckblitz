import { defineCard } from "../define.js";
import { unearth } from "../helpers.js";

// EDHREC rank 16342.
//
// Heroes' Hangout's "exile the top two, choose one, play it until the end of your next turn"
// (`impulse-exile` with `choose: 1`). Unearthed, the Desk has haste, and sacrificing it exiles it
// instead (the unearth replacement) — the cost is still paid.
//
// Rulings:
//   You must pay all costs and follow all normal timing rules for spells cast using the first
//   ability of Mishra's Research Desk.

const SAC_TEXT =
  "{1}, {T}, Sacrifice this artifact: Exile the top two cards of your library. Choose one of them. Until the end of your next turn, you may play that card.";

export default defineCard({
  name: "Mishra's Research Desk",
  manaCost: "{1}",
  colors: [],
  types: ["artifact"],
  text:
    `${SAC_TEXT}\nUnearth {1}{R} ({1}{R}: Return this card from your graveyard to the battlefield. ` +
    "Exile it at the beginning of the next end step or if it would leave the battlefield. Unearth only as a sorcery.)",
  activated: [
    {
      cost: { mana: "{1}", tap: true, sacrifice: "self" },
      targets: [],
      effect: { kind: "impulse-exile", amount: 2, duration: "your-next-turn", choose: 1 },
      resolve: null,
      text: SAC_TEXT,
    },
    unearth("{1}{R}"),
  ],
});
