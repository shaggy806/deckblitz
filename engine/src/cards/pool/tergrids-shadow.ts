import { defineCard } from "../define.js";

// EDHREC rank 15770. Kaldheim. Barter in Blood's shape, with foretell.

export default defineCard({
  name: "Tergrid's Shadow",
  manaCost: "{3}{B}{B}",
  colors: ["B"],
  types: ["instant"],
  foretell: { cost: "{2}{B}{B}" },
  text: "Each player sacrifices two creatures.\nForetell {2}{B}{B} (During your turn, you may pay {2} and exile this card from your hand face down. Cast it on a later turn for its foretell cost.)",
  targets: [],
  effect: { kind: "sacrifice", who: "each-player", filter: { type: "creature" }, count: 2 },
});
