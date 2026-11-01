import { defineCard } from "../define.js";

/** A modal double-faced card (instant // land) — its back face, Crackling
 * Falls, is a land you play instead. */
export default defineCard({
  name: "Rush of Inspiration",
  manaCost: "{1}{U/R}{U/R}",
  colors: ["U", "R"],
  types: ["instant"],
  text: "Draw two cards. Then discard a card at random unless you pay {E}{E} (two energy counters).",
  effect: {
    kind: "sequence",
    effects: [
      { kind: "draw", amount: 2 },
      {
        kind: "unless",
        chooser: "you",
        options: [{ payEnergy: 2, text: "Pay {E}{E}" }],
        otherwise: { kind: "discard", target: "you", amount: 1, random: true },
      },
    ],
  },
  faces: ["Rush of Inspiration", "Crackling Falls"],
});
