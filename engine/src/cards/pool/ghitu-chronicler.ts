import { defineCard } from "../define.js";

// EDHREC rank 21297.

export default defineCard({
  name: "Ghitu Chronicler",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Human", "Wizard"],
  power: 1,
  toughness: 3,
  kicker: { cost: "{3}{R}" },
  text: "Kicker {3}{R} (You may pay an additional {3}{R} as you cast this spell.)\nWhen this creature enters, if it was kicked, return target instant or sorcery card from your graveyard to your hand.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [
        {
          kind: "card-in-graveyard",
          whose: "you",
          filter: { typesAnyOf: ["instant", "sorcery"] },
        },
      ],
      effect: { kind: "return-to-hand", target: 0, from: "graveyard" },
      resolve: null,
      text: "When this creature enters, if it was kicked, return target instant or sorcery card from your graveyard to your hand.",
      condition: { kind: "self-kicked" },
    },
  ],
});
