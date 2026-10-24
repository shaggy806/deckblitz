import { defineCard } from "../define.js";

// Commander 2016 (C16). EDHREC rank 10262.
//
// The artifact card isn't targeted (ruling): it's chosen from the graveyard
// after the mill, so one of the five milled cards can be it (Glowspore
// Shaman's shape).
const SAC =
  "{4}, {T}, Sacrifice this land: Mill five cards. Then you may put an artifact card from your graveyard on top of your library.";

export default defineCard({
  name: "Sequestered Stash",
  colors: [],
  types: ["land"],
  text: `{T}: Add {C}.\n${SAC}`,
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
      text: SAC,
    },
  ],
});
