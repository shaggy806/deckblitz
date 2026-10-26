import { defineCard } from "../define.js";

export default defineCard({
  name: "Zombie Mob",
  manaCost: "{2}{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Zombie"],
  power: 2,
  toughness: 0,
  text: "This creature enters with a +1/+1 counter on it for each creature card in your graveyard.\nWhen this creature enters, exile all creature cards from your graveyard.",
  static: [
    {
      affects: { scope: "self" },
      replacement: {
        event: "enters-battlefield",
        counters: { kind: "+1/+1", amount: { countInGraveyard: { type: "creature", ownedBy: "you" } } },
      },
      text: "This creature enters with a +1/+1 counter on it for each creature card in your graveyard.",
    },
  ],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "exile-graveyard", target: "you", filter: { type: "creature" } },
      resolve: null,
      text: "When this creature enters, exile all creature cards from your graveyard.",
    },
  ],
});
