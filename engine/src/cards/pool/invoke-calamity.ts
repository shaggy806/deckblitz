import { defineCard } from "../define.js";

// EDHREC rank 4094.
//
// Cast one after the other as it resolves, each spell's mana value (as the
// spell it would be, X = 0) spending the running total. `inZone` keeps the offer
// to the two zones named: the second offer is over the cards first offered, and
// one of those exiled to pay the first spell's cost is no longer in either.
export default defineCard({
  name: "Invoke Calamity",
  manaCost: "{1}{R}{R}{R}{R}",
  colors: ["R"],
  types: ["instant"],
  text: "You may cast up to two instant and/or sorcery spells with total mana value 6 or less from your graveyard and/or hand without paying their mana costs. If those spells would be put into your graveyard, exile them instead. Exile Invoke Calamity.",
  exileOnResolve: true,
  effect: {
    kind: "cast-now",
    from: { zones: ["hand", "graveyard"] },
    repeat: true,
    upTo: 2,
    totalManaValue: 6,
    free: true,
    exileAfter: true,
    spell: { typesAnyOf: ["instant", "sorcery"], anyOf: [{ inZone: "hand" }, { inZone: "graveyard" }] },
  },
});
