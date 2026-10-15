import { defineCard } from "../define.js";

// EDHREC rank 19002.
//
// The count is taken after the mill, so the milled cards are in it; each card
// once, however many of the two types it has.

const TEXT =
  "When this creature enters, mill two cards, then put a +1/+1 counter on this creature for each artifact and/or creature card in your graveyard.";

export default defineCard({
  name: "Ooze Patrol",
  manaCost: "{3}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Ooze"],
  power: 2,
  toughness: 2,
  text: `${TEXT} (To mill two cards, put the top two cards of your library into your graveyard.)`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "mill", target: "you", amount: 2 },
          {
            kind: "add-counter",
            target: "source",
            counter: "+1/+1",
            amount: { countInGraveyard: { typesAnyOf: ["artifact", "creature"], ownedBy: "you" } },
          },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
