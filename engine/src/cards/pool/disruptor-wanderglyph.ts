import { defineCard } from "../define.js";

export default defineCard({
  name: "Disruptor Wanderglyph",
  manaCost: "{4}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Golem"],
  power: 3,
  toughness: 4,
  text: "Whenever this creature attacks, exile target card from an opponent's graveyard.",
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [{ kind: "card-in-graveyard", whose: "opponent" }],
      effect: { kind: "exile", target: 0 },
      resolve: null,
      text: "Whenever this creature attacks, exile target card from an opponent's graveyard.",
    },
  ],
});
