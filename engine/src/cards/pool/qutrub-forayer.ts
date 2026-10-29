import { defineCard } from "../define.js";

const DESTROY_MODE = "Destroy target creature that was dealt damage this turn.";
const EXILE_MODE = "Exile up to two target cards from a single graveyard.";

export default defineCard({
  name: "Qutrub Forayer",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Zombie", "Horror"],
  power: 3,
  toughness: 2,
  text: `When this creature enters, choose one —\n• ${DESTROY_MODE}\n• ${EXILE_MODE}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "modal",
        announced: true,
        minModes: 1,
        maxModes: 1,
        modes: [
          {
            text: DESTROY_MODE,
            targets: [{ kind: "permanent", whose: "any", filter: { type: "creature", damagedThisTurnBy: {} } }],
            effect: { kind: "destroy", target: 0 },
          },
          {
            text: EXILE_MODE,
            targets: [
              {
                kind: "any-number",
                of: { kind: "card-in-graveyard", whose: "any" },
                max: 2,
                sameController: true,
              },
            ],
            effect: {
              kind: "for-each-target",
              from: 0,
              simultaneous: true,
              effect: { kind: "exile", target: 0 },
            },
          },
        ],
      },
      resolve: null,
      text: "When this creature enters, choose one —",
    },
  ],
});
