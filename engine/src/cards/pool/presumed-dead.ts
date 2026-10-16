import { defineCard } from "../define.js";

// EDHREC rank 13654. Supernatural Stamina's shape — the granted "when this
// creature dies" returns it (untapped, under its owner's control) and then
// suspects the permanent it came back as.
const GRANTED = "When this creature dies, return it to the battlefield under its owner's control and suspect it.";

export default defineCard({
  name: "Presumed Dead",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["instant"],
  text: `Until end of turn, target creature gets +2/+0 and gains "${GRANTED}" (A suspected creature has menace and can't block.)`,
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "modify-pt", target: 0, power: 2, toughness: 0, duration: "end-of-turn" },
      {
        kind: "grant-triggered",
        target: 0,
        duration: "end-of-turn",
        ability: {
          trigger: { on: "dies", who: "self" },
          targets: [],
          effect: {
            kind: "sequence",
            effects: [
              { kind: "put-onto-battlefield", target: "trigger-object" },
              { kind: "suspect", target: "trigger-object" },
            ],
          },
          resolve: null,
          text: GRANTED,
        },
      },
    ],
  },
});
