import { defineCard } from "../define.js";

export default defineCard({
  name: "Ruin Rat",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Rat"],
  power: 1,
  toughness: 1,
  keywords: ["deathtouch"],
  text: "Deathtouch\nWhen this creature dies, exile target card from an opponent's graveyard.",
  triggered: [
    {
      trigger: { on: "dies", who: "self" },
      targets: [{ kind: "card-in-graveyard", whose: "opponent" }],
      effect: { kind: "exile", target: 0 },
      resolve: null,
      text: "When this creature dies, exile target card from an opponent's graveyard.",
    },
  ],
});
