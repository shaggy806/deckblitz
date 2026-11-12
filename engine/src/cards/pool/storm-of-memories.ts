import { defineCard } from "../define.js";

// EDHREC rank 13467.

export default defineCard({
  name: "Storm of Memories",
  manaCost: "{2}{R}{R}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: "Storm (When you cast this spell, copy it for each spell cast before it this turn.)\nExile an instant or sorcery card with mana value 3 or less from your graveyard at random. You may cast it without paying its mana cost. If that spell would be put into a graveyard, exile it instead.",
  targets: [],
  effect: {
    kind: "choose-random-card",
    zone: "graveyard",
    filter: { typesAnyOf: ["instant", "sorcery"], manaValue: { op: "lte", n: 3 } },
    then: {
      kind: "sequence",
      effects: [
        { kind: "exile", target: 0 },
        { kind: "cast-now", from: "exiled-this-way", free: true, exileAfter: true },
      ],
    },
  },
  triggered: [
    {
      trigger: { on: "this-cast" },
      targets: [],
      effect: { kind: "storm" },
      resolve: null,
      text: "Storm",
    },
  ],
});
