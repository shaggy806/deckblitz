import { defineCard } from "../define.js";

// Cryptek's delayed watch on one creature for the rest of the turn. A
// creature goes to its owner's graveyard, so "put into your graveyard" is
// one you own; it fires once, and the card comes back as a new object
// (the rulings).
const TEXT =
  "Sacrifice Saffi Eriksdotter: When target creature is put into your graveyard this turn, return that card to the battlefield.";

export default defineCard({
  name: "Saffi Eriksdotter",
  manaCost: "{G}{W}",
  colors: ["W", "G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Scout"],
  power: 2,
  toughness: 2,
  text: TEXT,
  activated: [
    {
      cost: { mana: null, tap: false, sacrifice: "self" },
      targets: ["creature"],
      effect: {
        kind: "delayed-trigger",
        at: { leaves: 0, to: ["graveyard"], thisTurn: true },
        effect: {
          kind: "conditional",
          condition: { kind: "trigger-object", filter: { ownedBy: "you" } },
          then: { kind: "put-onto-battlefield", target: "trigger-object" },
        },
        text: "When that creature is put into your graveyard this turn, return that card to the battlefield.",
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
