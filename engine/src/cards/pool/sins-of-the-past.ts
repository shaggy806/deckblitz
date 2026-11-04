import { defineCard } from "../define.js";

// Cast at its own timing this turn, X at 0 and no other alternative cost; additional
// costs are still paid (the rulings).
const SPELL_TEXT =
  "Until end of turn, you may cast target instant or sorcery card from your graveyard without paying its mana cost. If that spell would be put into your graveyard, exile it instead. Exile Sins of the Past.";

export default defineCard({
  name: "Sins of the Past",
  manaCost: "{4}{B}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: SPELL_TEXT,
  exileOnResolve: true,
  targets: [{ kind: "card-in-graveyard", whose: "you", filter: { typesAnyOf: ["instant", "sorcery"] } }],
  effect: { kind: "grant-graveyard-cast", target: 0, free: true, exileAfter: true },
});
