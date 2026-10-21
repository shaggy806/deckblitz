import { defineCard } from "../define.js";

// EDHREC rank 9827. Up to three targets, each with toughness X or less (not
// their total — the ruling); they're destroyed as one event, then, if X is 10
// or more, every creature card in your graveyard returns — those just
// destroyed among them, and whether or not any target was destroyed.
// Cast with no targets, it still resolves; with targets that have all become
// illegal, it doesn't (rule 608.2b).

export default defineCard({
  name: "Finale of Eternity",
  manaCost: "{X}{B}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "Destroy up to three target creatures with toughness X or less. If X is 10 or more, return all creature cards from your graveyard to the battlefield.",
  targets: [
    {
      kind: "any-number",
      of: { kind: "permanent", whose: "any", filter: { type: "creature", toughness: { op: "lte", n: "x" } } },
      max: 3,
    },
  ],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "for-each-target", from: 0, effect: { kind: "destroy", target: 0 }, simultaneous: true },
      {
        kind: "conditional",
        condition: { kind: "x", compare: { op: "gte", n: 10 } },
        then: { kind: "return-from-graveyard", filter: { type: "creature" }, destination: "battlefield", count: "all" },
      },
    ],
  },
});
