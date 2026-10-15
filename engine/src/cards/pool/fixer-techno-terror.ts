import { defineCard } from "../define.js";

// EDHREC rank 25857.
//
// Iron Man, Master of Machines' condition: an artifact entered the
// battlefield under your control this turn (`turn-history`, `who` "you").

const TEXT =
  "{T}, Pay 2 life: Draw a card. Activate only if an artifact entered the battlefield under your control this turn.";

export default defineCard({
  name: "Fixer, Techno Terror",
  manaCost: "{1}{B}",
  colors: ["B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Artificer", "Villain"],
  power: 2,
  toughness: 1,
  text: TEXT,
  activated: [
    {
      cost: { mana: null, tap: true, payLife: 2 },
      condition: { kind: "turn-history", what: "entered", filter: { type: "artifact" } },
      targets: [],
      effect: { kind: "draw", amount: 1 },
      resolve: null,
      text: TEXT,
    },
  ],
});
