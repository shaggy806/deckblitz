import { defineCard } from "../define.js";

export default defineCard({
  name: "Leonin of the Lost Pride",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Cat", "Warrior"],
  power: 3,
  toughness: 1,
  text: "When this creature dies, exile target card from an opponent's graveyard.",
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
