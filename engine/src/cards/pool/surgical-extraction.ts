import { defineCard } from "../define.js";

// EDHREC rank 13712. "Any number of cards with the same name as that card":
// the target itself among them, and any may be left (the ruling). Its owner's
// zones, whoever controls anything.

export default defineCard({
  name: "Surgical Extraction",
  manaCost: "{B/P}",
  colors: ["B"],
  types: ["instant"],
  text: "({B/P} can be paid with either {B} or 2 life.)\nChoose target card in a graveyard other than a basic land card. Search its owner's graveyard, hand, and library for any number of cards with the same name as that card and exile them. Then that player shuffles.",
  targets: [
    {
      kind: "card-in-graveyard",
      whose: "any",
      filter: { anyOf: [{ notTypes: ["land"] }, { notSupertype: "basic" }] },
    },
  ],
  effect: {
    kind: "search-library",
    whose: { ownerOfTarget: 0 },
    zones: "graveyard-hand-library",
    filter: { sameNameAsTarget: 0 },
    destination: "exile",
    min: 0,
    max: 99,
  },
});
