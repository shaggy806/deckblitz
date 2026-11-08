import { defineCard } from "../define.js";

const TEXT =
  "When this creature enters, each player who controls fewer lands than the player who controls the most lands searches their library for a number of basic land cards less than or equal to the difference, puts those cards onto the battlefield tapped, then shuffles.";

const LANDS = { type: "land", controlledBy: "you" } as const;

// Who searches is fixed as it resolves. A land one player finds can't change
// another's difference: nobody passes the most, so the most stays what it was.
export default defineCard({
  name: "Scholarship Sponsor",
  manaCost: "{3}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Advisor"],
  power: 3,
  toughness: 3,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "for-each-player",
        who: "each-player",
        whoIf: {
          kind: "of-player",
          player: "that-player",
          condition: {
            kind: "player-compare",
            stat: { controls: { type: "land" } },
            compare: "fewer",
            than: "an-opponent",
          },
        },
        effect: {
          kind: "search-library",
          who: "that-player",
          filter: { supertype: "basic", type: "land" },
          destination: "battlefield",
          enterTapped: true,
          min: 0,
          max: {
            difference: [
              { amongPlayers: "greatest", of: { countOf: LANDS, forEachPlayer: true } },
              { countOf: LANDS, forPlayer: "that-player" },
            ],
          },
        },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
