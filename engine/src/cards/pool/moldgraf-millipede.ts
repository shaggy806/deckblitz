import { defineCard } from "../define.js";

// Rulings:
//   Moldgraf Millipede gets a +1/+1 counter for every creature card in your graveyard, including
//   any creature cards that were already there before you milled three cards.

const TEXT =
  "When this creature enters, mill three cards, then put a +1/+1 counter on this creature for each creature card in your graveyard.";

export default defineCard({
  name: "Moldgraf Millipede",
  manaCost: "{4}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Insect", "Horror"],
  power: 2,
  toughness: 2,
  text: `${TEXT} (To mill three cards, put the top three cards of your library into your graveyard.)`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "mill", target: "you", amount: 3 },
          {
            kind: "add-counter",
            target: "source",
            counter: "+1/+1",
            amount: { countInGraveyard: { type: "creature", ownedBy: "you" } },
          },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
