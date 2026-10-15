import { defineCard } from "../define.js";

// EDHREC rank 19188.
//
// Grapple with the Past's shape: the return isn't targeted, so it may take a
// land card the mill just put there.

const TEXT =
  "When this creature enters, mill three cards, then you may return a land card from your graveyard to your hand.";

export default defineCard({
  name: "Pothole Mole",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Mole"],
  power: 2,
  toughness: 3,
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
            kind: "look-and-choose",
            zone: "graveyard",
            min: 0,
            max: 1,
            destination: "hand",
            leftover: "stay",
            filter: { type: "land" },
          },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
