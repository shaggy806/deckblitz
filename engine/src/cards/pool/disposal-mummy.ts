import { defineCard } from "../define.js";

export default defineCard({
  name: "Disposal Mummy",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Zombie", "Jackal"],
  power: 2,
  toughness: 3,
  text: "When this creature enters, exile target card from an opponent's graveyard.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [{ kind: "card-in-graveyard", whose: "opponent" }],
      effect: { kind: "exile", target: 0 },
      resolve: null,
      text: "When this creature enters, exile target card from an opponent's graveyard.",
    },
  ],
});
