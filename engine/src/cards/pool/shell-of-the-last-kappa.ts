import { defineCard } from "../define.js";

// EDHREC rank 22381.
//
// Rulings:
//   [2004-12-01] Exiling a spell prevents that spell from resolving, but it doesn’t technically
//     “counter” anything. This means that Shell of the Last Kappa can exile spells which “can’t be
//     countered.”
//   [2004-12-01] Shell of the Last Kappa’s first ability can only target a spell that targets you.
//
// The first ability exiles the spell (Mindbreak Trap's `exile` of a spell —
// not a counter, so "can't be countered" doesn't stop it), linked to this
// stint of the Shell (rule 607.2a); the second casts one of those cards free
// (Izzet Chemister's linked cast, once rather than any number).

const EXILE_TEXT = "{3}, {T}: Exile target instant or sorcery spell that targets you. (The spell has no effect.)";
const CAST_TEXT =
  "{3}, {T}, Sacrifice Shell of the Last Kappa: You may cast a spell from among cards exiled with Shell of the Last Kappa without paying its mana cost.";

export default defineCard({
  name: "Shell of the Last Kappa",
  manaCost: "{3}",
  colors: [],
  supertypes: ["legendary"],
  types: ["artifact"],
  text: `${EXILE_TEXT}\n${CAST_TEXT}`,
  activated: [
    {
      cost: { mana: "{3}", tap: true },
      targets: [{ kind: "spell", filter: { typesAnyOf: ["instant", "sorcery"], targets: { player: "you" } } }],
      effect: { kind: "exile", target: 0, linked: true },
      resolve: null,
      text: EXILE_TEXT,
    },
    {
      cost: { mana: "{3}", tap: true, sacrifice: "self" },
      targets: [],
      effect: { kind: "cast-now", from: "exiled-with-source", free: true },
      resolve: null,
      text: CAST_TEXT,
    },
  ],
});
