import { defineCard } from "../define.js";

// Will of the council (rule 701.38): each player, starting with you, votes
// for one card in your graveyard; every card with the most votes, ties
// included, returns to your hand. With nothing to vote for, no one votes and
// nothing returns (the rulings).

const TEXT =
  "Will of the council — When this creature enters, starting with you, each player votes for an artifact, creature, or enchantment card in your graveyard. Return each card with the most votes or tied for most votes to your hand.";

export default defineCard({
  name: "Custodi Squire",
  manaCost: "{4}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Spirit", "Cleric"],
  power: 3,
  toughness: 3,
  keywords: ["flying"],
  text: `Flying\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "vote", for: { graveyardCard: { typesAnyOf: ["artifact", "creature", "enchantment"] } } },
          {
            kind: "for-each-voted",
            which: "most",
            simultaneous: true,
            effect: { kind: "return-to-hand", target: 0, from: "graveyard" },
          },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
