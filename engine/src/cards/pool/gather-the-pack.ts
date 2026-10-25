import { defineCard } from "../define.js";

// Magic Origins (ORI). EDHREC rank 19375.
//
// Spell mastery is checked as it resolves, before the reveal: up to two creature cards instead
// of up to one.
const REVEAL = { kind: "look-and-choose", zone: "library", count: 5, reveal: true, min: 0, destination: "hand", leftover: "graveyard", filter: { type: "creature" } } as const;

export default defineCard({
  name: "Gather the Pack",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["sorcery"],
  text: "Reveal the top five cards of your library. You may put a creature card from among them into your hand. Put the rest into your graveyard.\nSpell mastery — If there are two or more instant and/or sorcery cards in your graveyard, put up to two creature cards from among the revealed cards into your hand instead of one.",
  targets: [],
  effect: {
    kind: "conditional",
    condition: { kind: "cards-in-graveyard", atLeast: 2, filter: { typesAnyOf: ["instant", "sorcery"] } },
    then: { ...REVEAL, max: 2 },
    else: { ...REVEAL, max: 1 },
  },
});
