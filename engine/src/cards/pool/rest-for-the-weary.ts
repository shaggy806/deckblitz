import { defineCard } from "../define.js";

// Worldwake (WWK). EDHREC rank 14779.
//
// Landfall here looks back over the turn as the spell resolves (the
// rulings): a land that entered under your control this turn, wherever it is
// now. The 8 replaces the 4 rather than adding to it.
export default defineCard({
  name: "Rest for the Weary",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["instant"],
  text: "Target player gains 4 life.\nLandfall — If you had a land enter the battlefield under your control this turn, that player gains 8 life instead.",
  targets: ["player"],
  effect: {
    kind: "conditional",
    condition: { kind: "turn-history", what: "entered", who: "you", filter: { type: "land" }, atLeast: 1 },
    then: { kind: "gain-life", amount: 8, toControllerOfTarget: 0 },
    else: { kind: "gain-life", amount: 4, toControllerOfTarget: 0 },
  },
});
