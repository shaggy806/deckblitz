import { defineCard } from "../define.js";

// EDHREC rank 9735.
//
// The look is optional ("you may look … If you do"); the land, if one is
// taken, is revealed and goes back on top, and the rest go to the bottom in
// a random order. Taking none sends all four to the bottom.
const LOOK_TEXT =
  "When this artifact enters, you may look at the top four cards of your library. If you do, reveal up to one land card from among them, then put that card on top of your library and the rest on the bottom in a random order.";

export default defineCard({
  name: "Planar Atlas",
  manaCost: "{2}",
  colors: [],
  types: ["artifact"],
  text: `This artifact enters tapped.\n${LOOK_TEXT}\n{T}: Add {C}.`,
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", tapped: true },
      text: "This artifact enters tapped.",
    },
  ],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Look at the top four cards of your library?",
        effect: {
          kind: "look-and-choose",
          zone: "library",
          count: 4,
          reveal: "chosen",
          min: 0,
          max: 1,
          filter: { type: "land" },
          destination: "library-top",
          leftover: "bottom-random",
        },
      },
      resolve: null,
      text: LOOK_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "add-mana", mana: "C", amount: 1 },
      resolve: null,
      text: "{T}: Add {C}.",
    },
  ],
});
