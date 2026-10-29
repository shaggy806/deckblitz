import { defineCard } from "../define.js";

// The −8's control change has no duration (the ruling).
export default defineCard({
  name: "Tezzeret, Master of Metal",
  manaCost: "{4}{U}{B}",
  colors: ["U", "B"],
  supertypes: ["legendary"],
  types: ["planeswalker"],
  subtypes: ["Tezzeret"],
  loyalty: 5,
  text: "+1: Reveal cards from the top of your library until you reveal an artifact card. Put that card into your hand and the rest on the bottom of your library in a random order.\n−3: Target opponent loses life equal to the number of artifacts you control.\n−8: Gain control of all artifacts and creatures target opponent controls.",
  activated: [
    {
      loyaltyCost: 1,
      cost: { mana: null, tap: false },
      targets: [],
      effect: { kind: "reveal-until", filter: { type: "artifact" }, put: "hand", rest: "bottom-random" },
      resolve: null,
      text: "+1: Reveal cards from the top of your library until you reveal an artifact card. Put that card into your hand and the rest on the bottom of your library in a random order.",
    },
    {
      loyaltyCost: -3,
      cost: { mana: null, tap: false },
      targets: ["opponent"],
      effect: { kind: "lose-life", target: 0, amount: { countOf: { type: "artifact", controlledBy: "you" } } },
      resolve: null,
      text: "−3: Target opponent loses life equal to the number of artifacts you control.",
    },
    {
      loyaltyCost: -8,
      cost: { mana: null, tap: false },
      targets: ["opponent"],
      effect: {
        kind: "gain-control-all",
        filter: { typesAnyOf: ["artifact", "creature"] },
        untilEndOfTurn: false,
        controlledByTarget: 0,
      },
      resolve: null,
      text: "−8: Gain control of all artifacts and creatures target opponent controls.",
    },
  ],
});
