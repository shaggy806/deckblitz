import { defineCard } from "../define.js";

// EDHREC rank 20606.
//
// "Food card" is any card with the artifact subtype Food (the rulings).

const TEXT =
  "When this creature enters, return up to one target creature or Food card from your graveyard to your hand.";

export default defineCard({
  name: "Ragamuffin Raptor",
  manaCost: "{4}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Dinosaur"],
  power: 4,
  toughness: 3,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [
        {
          kind: "optional",
          of: {
            kind: "card-in-graveyard",
            whose: "you",
            filter: { anyOf: [{ type: "creature" }, { subtype: "Food" }] },
          },
        },
      ],
      effect: { kind: "return-to-hand", target: 0, from: "graveyard" },
      resolve: null,
      text: TEXT,
    },
  ],
});
