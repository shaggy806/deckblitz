import { defineCard } from "../define.js";

// EDHREC rank 15232.

const TEXT = "When this creature dies, return another target creature card from your graveyard to your hand.";

export default defineCard({
  name: "Dutiful Attendant",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Human", "Warrior"],
  power: 1,
  toughness: 2,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "dies", who: "self" },
      targets: [
        {
          kind: "other",
          of: { kind: "card-in-graveyard", whose: "you", filter: { type: "creature" } },
          than: "source",
        },
      ],
      effect: { kind: "return-to-hand", target: 0, from: "graveyard" },
      resolve: null,
      text: TEXT,
    },
  ],
});
