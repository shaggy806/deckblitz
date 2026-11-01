import { defineCard } from "../define.js";

// Mirrodin Besieged (MBS). The cards may be in different graveyards: each
// goes into its owner's library, and each library that got one is shuffled.

export default defineCard({
  name: "Turn the Earth",
  manaCost: "{G}",
  colors: ["G"],
  types: ["instant"],
  flashback: { cost: "{1}{G}" },
  text: "Choose up to three target cards in graveyards. The owners of those cards shuffle them into their libraries. You gain 2 life.\nFlashback {1}{G} (You may cast this card from your graveyard for its flashback cost. Then exile it.)",
  targets: [{ kind: "any-number", of: { kind: "card-in-graveyard", whose: "any" }, max: 3 }],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "put-on-libraries", what: { targetsFrom: 0 }, position: "shuffle" },
      { kind: "gain-life", amount: 2 },
    ],
  },
});
