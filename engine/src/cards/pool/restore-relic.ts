import { defineCard } from "../define.js";

// Lorehold Archivist's prepare spell (rule 722): no card of its own, only
// ever cast as the copy a prepared Archivist makes in exile (722.3c). The
// Scarab God's shape: the token copies the card as printed (the ruling), read
// in exile once it's there; an {X} in its cost is 0.
export default defineCard({
  name: "Restore Relic",
  manaCost: "{2}{R}{W}",
  colors: ["R", "W"],
  types: ["sorcery"],
  prepareSpellOnly: true,
  text: "Exile target artifact or creature card from your graveyard. Create a token that's a copy of it.",
  targets: [{ kind: "card-in-graveyard", whose: "you", filter: { typesAnyOf: ["artifact", "creature"] } }],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "exile", target: 0 },
      { kind: "create-token-copy", of: 0, count: 1, who: "you" },
    ],
  },
});
