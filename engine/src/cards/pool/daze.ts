import { defineCard } from "../define.js";

// REVIEW — auto-finished by `npm run card:scaffold` from the Oracle snapshot: every line
// of its text matched a template, so nothing was left to author. Not in the registry:
// check it against the card's Oracle text, then move it into cards/pool/ (or tokens/)
// and run `npm run gen:cards -w engine`.
// EDHREC rank 3006.

export default defineCard({
  name: "Daze",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["instant"],
  alternativeCost: {
    mana: "{0}",
    returnToHand: { filter: { type: "land", subtype: "Island" }, text: "an Island you control" },
  },
  text: "You may return an Island you control to its owner's hand rather than pay this spell's mana cost.\nCounter target spell unless its controller pays {1}.",
  targets: ["spell"],
  effect: {
    kind: "unless",
    chooser: 0,
    options: [{ pay: "{1}", text: "Pay {1}" }],
    otherwise: { kind: "counter", target: 0 },
  },
});
