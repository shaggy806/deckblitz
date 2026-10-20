import { defineCard } from "../define.js";

export default defineCard({
  name: "Revolutionist",
  manaCost: "{5}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Human", "Wizard"],
  power: 3,
  toughness: 3,
  madness: { cost: "{3}{R}" },
  text: "When this creature enters, return target instant or sorcery card from your graveyard to your hand.\nMadness {3}{R} (If you discard this card, discard it into exile. When you do, cast it for its madness cost or put it into your graveyard.)",
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
      text: "When this creature enters, return target instant or sorcery card from your graveyard to your hand.",
    },
  ],
});
