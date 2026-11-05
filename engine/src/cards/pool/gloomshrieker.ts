import { defineCard } from "../define.js";

// EDHREC rank 7435.

export default defineCard({
  name: "Gloomshrieker",
  manaCost: "{1}{B}{G}",
  colors: ["B", "G"],
  types: ["enchantment", "creature"],
  subtypes: ["Cat", "Beast"],
  power: 2,
  toughness: 1,
  keywords: ["menace"],
  text: "Menace (This creature can't be blocked except by two or more creatures.)\nWhen this creature enters, return target permanent card from your graveyard to your hand.\nIf this creature would die, exile it instead.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [
        {
          kind: "card-in-graveyard",
          whose: "you",
          filter: { notTypes: ["instant", "sorcery"] },
        },
      ],
      effect: { kind: "return-to-hand", target: 0, from: "graveyard" },
      resolve: null,
      text: "When this creature enters, return target permanent card from your graveyard to your hand.",
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      replacement: {
        event: "would-be-put-into-graveyard",
        instead: "exile",
        self: true,
        from: "battlefield",
      },
      text: "If this creature would die, exile it instead.",
    },
  ],
});
