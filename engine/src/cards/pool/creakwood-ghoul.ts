import { defineCard } from "../define.js";

export default defineCard({
  name: "Creakwood Ghoul",
  manaCost: "{4}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Plant", "Zombie"],
  power: 3,
  toughness: 3,
  text: "{B/G}{B/G}: Exile target card from a graveyard. You gain 1 life.",
  activated: [
    {
      cost: { mana: "{B/G}{B/G}", tap: false },
      targets: [{ kind: "card-in-graveyard", whose: "any" }],
      effect: {
        kind: "sequence",
        effects: [{ kind: "exile", target: 0 }, { kind: "gain-life", amount: 1 }],
      },
      resolve: null,
      text: "{B/G}{B/G}: Exile target card from a graveyard. You gain 1 life.",
    },
  ],
});
