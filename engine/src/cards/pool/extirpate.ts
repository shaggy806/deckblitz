import { defineCard } from "../define.js";

// EDHREC rank 22473. "All cards": the graveyard's, the target among them, must
// be found; the hand's and library's may be left (rule 701.23b).

export default defineCard({
  name: "Extirpate",
  manaCost: "{B}",
  colors: ["B"],
  types: ["instant"],
  splitSecond: true,
  text: "Split second (As long as this spell is on the stack, players can't cast spells or activate abilities that aren't mana abilities.)\nChoose target card in a graveyard other than a basic land card. Search its owner's graveyard, hand, and library for all cards with the same name as that card and exile them. Then that player shuffles.",
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
    all: true,
    min: 0,
    max: 99,
  },
});
