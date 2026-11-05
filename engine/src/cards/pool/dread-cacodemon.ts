import { defineCard } from "../define.js";

const ENTERS =
  "When this creature enters, if you cast it from your hand, destroy all creatures your opponents control, then tap all other creatures you control.";

export default defineCard({
  name: "Dread Cacodemon",
  manaCost: "{7}{B}{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Demon"],
  power: 8,
  toughness: 8,
  text: ENTERS,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      condition: { kind: "source", filter: { cast: true, castBy: "you", castFrom: "hand" } },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "destroy-all", filter: { type: "creature", controlledBy: "opponent" } },
          {
            kind: "for-each-permanent",
            filter: { type: "creature", controlledBy: "you" },
            exceptSource: true,
            simultaneous: true,
            effect: { kind: "tap", target: 0 },
          },
        ],
      },
      resolve: null,
      text: ENTERS,
    },
  ],
});
