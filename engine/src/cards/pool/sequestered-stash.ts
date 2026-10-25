import { defineCard } from "../define.js";

// Kaladesh (KLD). EDHREC rank 10262.
//
// The artifact card isn't targeted: any one in your graveyard after the mill,
// one of the five milled included (the ruling).
export default defineCard({
  name: "Sequestered Stash",
  colors: [],
  types: ["land"],
  text: "{T}: Add {C}.\n{4}, {T}, Sacrifice this land: Mill five cards. Then you may put an artifact card from your graveyard on top of your library.",
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "add-mana", mana: "C", amount: 1 },
      resolve: null,
      text: "{T}: Add {C}.",
    },
    {
      cost: { mana: "{4}", tap: true, sacrifice: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "mill", target: "you", amount: 5 },
          {
            kind: "look-and-choose",
            zone: "graveyard",
            min: 0,
            max: 1,
            filter: { type: "artifact" },
            destination: "library-top",
            leftover: "stay",
          },
        ],
      },
      resolve: null,
      text: "{4}, {T}, Sacrifice this land: Mill five cards. Then you may put an artifact card from your graveyard on top of your library.",
    },
  ],
});
