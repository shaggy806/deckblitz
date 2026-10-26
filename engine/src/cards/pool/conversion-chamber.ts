import { defineCard } from "../define.js";

// REVIEW — auto-finished by `npm run card:scaffold` from the Oracle snapshot: every line
// of its text matched a template, so nothing was left to author. Not in the registry:
// check it against the card's Oracle text, then move it into cards/pool/ (or tokens/)
// and run `npm run gen:cards -w engine`.
// EDHREC rank 23698.
// Makes Phyrexian Golem → use "Phyrexian Golem Token".

export default defineCard({
  name: "Conversion Chamber",
  manaCost: "{3}",
  colors: [],
  types: ["artifact"],
  text: "{2}, {T}: Exile target artifact card from a graveyard. Put a charge counter on this artifact.\n{2}, {T}, Remove a charge counter from this artifact: Create a 3/3 colorless Phyrexian Golem artifact creature token.",
  activated: [
    {
      cost: { mana: "{2}", tap: true },
      targets: [{ kind: "card-in-graveyard", whose: "any", filter: { type: "artifact" } }],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "exile", target: 0 },
          { kind: "add-counter", target: "source", counter: "charge", amount: 1 },
        ],
      },
      resolve: null,
      text: "{2}, {T}: Exile target artifact card from a graveyard. Put a charge counter on this artifact.",
    },
    {
      cost: { mana: "{2}", tap: true, removeCounter: { kind: "charge", count: 1 } },
      targets: [],
      effect: { kind: "create-token", token: "Phyrexian Golem Token", count: 1 },
      resolve: null,
      text: "{2}, {T}, Remove a charge counter from this artifact: Create a 3/3 colorless Phyrexian Golem artifact creature token.",
    },
  ],
});
