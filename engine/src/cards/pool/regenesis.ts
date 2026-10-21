import { defineCard } from "../define.js";
import { distinctTargets } from "../helpers.js";

// EDHREC rank 21350. Rydia's Return's second mode: "up to two target
// permanent cards" (not instants or sorceries), returned together.
export default defineCard({
  name: "Regenesis",
  manaCost: "{3}{G}{G}",
  colors: ["G"],
  types: ["instant"],
  text: "Return up to two target permanent cards from your graveyard to your hand.",
  targets: distinctTargets(
    2,
    { kind: "card-in-graveyard", whose: "you", filter: { notTypes: ["instant", "sorcery"] } },
    { optional: true },
  ),
  effect: {
    kind: "sequence",
    simultaneous: true,
    effects: [
      { kind: "return-to-hand", target: 0, from: "graveyard" },
      { kind: "return-to-hand", target: 1, from: "graveyard" },
    ],
  },
});
