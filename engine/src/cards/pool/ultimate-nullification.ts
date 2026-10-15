import { defineCard } from "../define.js";

// EDHREC rank 21879.
// "Exile all creatures and graveyards" is one instruction, so one event
// (`simultaneous`); then the spell puts itself on the bottom of its owner's
// library as it resolves (Approach of the Second Sun's `put-on-library` of
// `"source"`) — countered, it goes to the graveyard as usual.

export default defineCard({
  name: "Ultimate Nullification",
  manaCost: "{4}{W}",
  colors: ["W"],
  types: ["sorcery"],
  text: "As an additional cost to cast this spell, sacrifice a legendary creature.\nExile all creatures and graveyards. Put Ultimate Nullification on the bottom of its owner's library.",
  additionalCost: { sacrifice: { type: "creature", supertype: "legendary", controlledBy: "you" } },
  targets: [],
  effect: {
    kind: "sequence",
    effects: [
      {
        kind: "sequence",
        simultaneous: true,
        effects: [
          { kind: "exile-all", filter: { type: "creature" } },
          { kind: "exile-graveyard", target: "each-player" },
        ],
      },
      { kind: "put-on-library", target: "source", position: "bottom" },
    ],
  },
});
