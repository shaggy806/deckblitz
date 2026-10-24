import { defineCard } from "../define.js";

// Kaladesh (KLD). EDHREC rank 25425.
//
// Mortuary Mire's "you may put target … on top of your library": the slot is
// optional.
const TEXT =
  "When this creature enters, you may put target artifact or creature card from your graveyard on top of your library.";

export default defineCard({
  name: "Dukhara Scavenger",
  manaCost: "{5}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Crocodile"],
  power: 4,
  toughness: 6,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [
        {
          kind: "optional",
          of: { kind: "card-in-graveyard", whose: "you", filter: { typesAnyOf: ["artifact", "creature"] } },
        },
      ],
      effect: { kind: "put-on-library", target: 0, position: "top" },
      resolve: null,
      text: TEXT,
    },
  ],
});
