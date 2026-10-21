import { defineCard } from "../define.js";

// EDHREC rank 13430.
//
// Rulings:
//   [2019-06-14] Because Conifer Wurm is itself a snow permanent, its ability will usually give it
//     at least +1/+1.
//   [2019-06-14] The value of X is determined only as Conifer Wurm's ability begins to resolve.

const X = { countOf: { supertype: "snow", controlledBy: "you" } } as const;

export default defineCard({
  name: "Conifer Wurm",
  manaCost: "{4}{G}",
  colors: ["G"],
  supertypes: ["snow"],
  types: ["creature"],
  subtypes: ["Wurm"],
  power: 4,
  toughness: 4,
  keywords: ["trample"],
  text: "Trample\n{3}{G}: This creature gets +X/+X until end of turn, where X is the number of snow permanents you control.",
  activated: [
    {
      cost: { mana: "{3}{G}", tap: false },
      targets: [],
      effect: { kind: "modify-pt", target: "source", power: X, toughness: X, duration: "end-of-turn" },
      resolve: null,
      text: "{3}{G}: This creature gets +X/+X until end of turn, where X is the number of snow permanents you control.",
    },
  ],
});
