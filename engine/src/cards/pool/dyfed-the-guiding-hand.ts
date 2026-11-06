import { defineCard } from "../define.js";

// REVIEW — auto-finished by `npm run card:scaffold` from the Oracle snapshot: every line
// of its text matched a template, so nothing was left to author. Not in the registry:
// check it against the card's Oracle text, then move it into cards/pool/ (or tokens/)
// and run `npm run gen:cards -w engine`.
// EDHREC rank 25758.
// Makes Powerstone → use "Powerstone Token".

export default defineCard({
  name: "Dyfed, the Guiding Hand",
  manaCost: "{3}{U}{U}",
  colors: ["U"],
  supertypes: ["legendary"],
  types: ["planeswalker"],
  subtypes: ["Dyfed"],
  loyalty: 4,
  canBeCommander: true,
  text: "+1: Create two tapped Powerstone tokens. (They're artifacts with \"{T}: Add {C}. This mana can't be spent to cast a nonartifact spell.\")\n−X: Untap X target artifacts.\n−6: Search your library for an artifact card, put it onto the battlefield, then shuffle.\nDyfed, the Guiding Hand can be your commander.",
  activated: [
    {
      loyaltyCost: 1,
      cost: { mana: null, tap: false },
      targets: [],
      effect: { kind: "create-token", token: "Powerstone Token", count: 2, tapped: true },
      resolve: null,
      text: "+1: Create two tapped Powerstone tokens.",
    },
    {
      loyaltyCost: "-x",
      cost: { mana: null, tap: false },
      targets: [{ kind: "any-number", of: "artifact", min: "x", max: "x" }],
      effect: { kind: "for-each-target", from: 0, effect: { kind: "untap", target: 0 } },
      resolve: null,
      text: "−X: Untap X target artifacts.",
    },
    {
      loyaltyCost: -6,
      cost: { mana: null, tap: false },
      targets: [],
      effect: {
        kind: "search-library",
        filter: { type: "artifact" },
        destination: "battlefield",
        min: 0,
        max: 1,
      },
      resolve: null,
      text: "−6: Search your library for an artifact card, put it onto the battlefield, then shuffle.",
    },
  ],
});
