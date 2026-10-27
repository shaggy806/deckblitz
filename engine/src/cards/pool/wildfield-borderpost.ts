import { defineCard } from "../define.js";

// REVIEW — auto-finished by `npm run card:scaffold` from the Oracle snapshot: every line
// of its text matched a template, so nothing was left to author. Not in the registry:
// check it against the card's Oracle text, then move it into cards/pool/ (or tokens/)
// and run `npm run gen:cards -w engine`.
// EDHREC rank 19190.

export default defineCard({
  name: "Wildfield Borderpost",
  manaCost: "{1}{G}{W}",
  colors: ["W", "G"],
  types: ["artifact"],
  alternativeCost: {
    mana: "{1}",
    returnToHand: { filter: { type: "land", supertype: "basic" }, text: "a basic land you control" },
  },
  text: "You may pay {1} and return a basic land you control to its owner's hand rather than pay this spell's mana cost.\nThis artifact enters tapped.\n{T}: Add {G} or {W}.",
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "add-mana", mana: { oneOf: ["G", "W"] }, amount: 1 },
      resolve: null,
      text: "{T}: Add {G} or {W}.",
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", tapped: true },
      text: "This artifact enters tapped.",
    },
  ],
});
