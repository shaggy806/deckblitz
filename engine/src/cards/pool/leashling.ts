import { defineCard } from "../define.js";

export default defineCard({
  name: "Leashling",
  manaCost: "{6}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Dog"],
  power: 3,
  toughness: 3,
  text: "Put a card from your hand on top of your library: Return this creature to its owner's hand.",
  activated: [
    {
      cost: { mana: null, tap: false, do: { kind: "look-and-choose", zone: "hand", min: 1, max: 1, destination: "library-top", leftover: "stay" } },
      targets: [],
      effect: { kind: "return-to-hand", target: "source" },
      resolve: null,
      text: "Put a card from your hand on top of your library: Return this creature to its owner's hand.",
    },
  ],
});
