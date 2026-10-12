import { defineCard } from "../define.js";

export default defineCard({
  name: "Scavenging Harpy",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Harpy"],
  power: 2,
  toughness: 1,
  keywords: ["flying"],
  text: "Flying\nWhen this creature enters, exile target card from an opponent's graveyard.",
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
