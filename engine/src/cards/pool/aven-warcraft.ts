import { defineCard } from "../define.js";

// EDHREC rank 27316.
//
// The colour is chosen only with threshold, as it resolves, and feeds the one
// grant.
export default defineCard({
  name: "Aven Warcraft",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["instant"],
  text: "Creatures you control get +0/+2 until end of turn.\nThreshold — If there are seven or more cards in your graveyard, choose a color. Creatures you control also gain protection from the chosen color until end of turn.",
  targets: [],
  effect: {
    kind: "sequence",
    effects: [
      {
        kind: "modify-pt-all",
        filter: { type: "creature", controlledBy: "you" },
        power: 0,
        toughness: 2,
        duration: "end-of-turn",
      },
      {
        kind: "conditional",
        condition: { kind: "threshold" },
        then: {
          kind: "grant-protection",
          filter: { type: "creature", controlledBy: "you" },
          from: { choose: "color" },
          duration: "end-of-turn",
        },
      },
    ],
  },
});
