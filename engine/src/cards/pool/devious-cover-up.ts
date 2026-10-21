import { defineCard } from "../define.js";

export default defineCard({
  name: "Devious Cover-Up",
  manaCost: "{2}{U}{U}",
  colors: ["U"],
  types: ["instant"],
  text: "Counter target spell. If that spell is countered this way, exile it instead of putting it into its owner's graveyard. You may shuffle up to four target cards from your graveyard into your library.",
  targets: ["spell", { kind: "any-number", of: { kind: "card-in-graveyard", whose: "you" }, max: 4 }],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "counter", target: 0, into: "exile" },
      {
        // Zero cards may be targeted and the library still shuffled (the
        // rulings), as Cathartic Parting's identical clause.
        kind: "may",
        prompt: "Shuffle the targeted cards from your graveyard into your library?",
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
