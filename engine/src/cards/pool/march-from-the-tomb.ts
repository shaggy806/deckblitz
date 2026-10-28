import { defineCard } from "../define.js";

// Patch Up's shape: the cards' total mana value in the graveyard, any
// number of them.
// EDHREC rank 18593.

export default defineCard({
  name: "March from the Tomb",
  manaCost: "{3}{W}{B}",
  colors: ["W", "B"],
  types: ["sorcery"],
  text: "Return any number of target Ally creature cards with total mana value 8 or less from your graveyard to the battlefield.",
  targets: [
    {
      kind: "any-number",
      of: {
        kind: "card-in-graveyard",
        whose: "you",
        filter: { subtype: "Ally", type: "creature" },
      },
      maxTotalManaValue: 8,
    },
  ],
  effect: {
    kind: "for-each-target",
    from: 0,
    simultaneous: true,
    effect: { kind: "put-onto-battlefield", target: 0 },
  },
});
