import { defineCard } from "../define.js";

export default defineCard({
  name: "Graven Abomination",
  manaCost: "{3}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Horror"],
  power: 3,
  toughness: 1,
  text: "Whenever this creature attacks, exile target card from defending player's graveyard.",
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [{ kind: "card-in-graveyard", whose: "defending-player" }],
      effect: { kind: "exile", target: 0 },
      resolve: null,
      text: "Whenever this creature attacks, exile target card from defending player's graveyard.",
    },
  ],
});
