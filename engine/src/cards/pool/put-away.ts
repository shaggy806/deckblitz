import { defineCard } from "../define.js";

// Shadowmoor (SHM). EDHREC rank 25273.
//
// Devious Cover-Up's shape with one graveyard card at most and no exile. Both
// targets are chosen on cast (the rulings), so the countered spell can't be
// the card shuffled away; either target may be illegal and the other still
// acted on.

export default defineCard({
  name: "Put Away",
  manaCost: "{2}{U}{U}",
  colors: ["U"],
  types: ["instant"],
  text: "Counter target spell. You may shuffle up to one target card from your graveyard into your library.",
  targets: ["spell", { kind: "any-number", of: { kind: "card-in-graveyard", whose: "you" }, max: 1 }],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "counter", target: 0 },
      {
        kind: "may",
        prompt: "Shuffle the targeted card from your graveyard into your library?",
        effect: {
          kind: "sequence",
          effects: [
            {
              kind: "for-each-target",
              from: 1,
              simultaneous: true,
              effect: { kind: "put-on-library", target: 1, position: "top" },
            },
            { kind: "shuffle-library" },
          ],
        },
      },
    ],
  },
});
