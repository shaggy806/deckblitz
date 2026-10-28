import { defineCard } from "../define.js";

// EDHREC rank 26919. "The exiled card" is read in exile, where a Theros God
// is a God card whatever its devotion did on the battlefield.

export default defineCard({
  name: "Deicide",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["instant"],
  text: "Exile target enchantment. If the exiled card is a God card, search its controller's graveyard, hand, and library for any number of cards with the same name as that card and exile them. Then that player shuffles.",
  targets: ["enchantment"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "exile", target: 0 },
      {
        kind: "conditional",
        condition: { kind: "target", index: 0, filter: { subtype: "God" }, now: true },
        then: {
          kind: "search-library",
          whose: { controllerOfTarget: 0 },
          zones: "graveyard-hand-library",
          filter: { sameNameAsTarget: 0 },
          destination: "exile",
          min: 0,
          max: 99,
        },
      },
    ],
  },
});
