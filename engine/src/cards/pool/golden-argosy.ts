import { crew, crewText } from "../helpers.js";
import { defineCard } from "../define.js";

// EDHREC rank 6089.
//
// Only creatures still on the battlefield as this resolves are exiled, and they
// come back even if the Argosy has gone (the rulings): one delayed ability
// about what this exiled, tapped, under their owners' control, together.

const ATTACK_TEXT =
  "Whenever Golden Argosy attacks, exile each creature that crewed it this turn. Return them to the battlefield tapped under their owner's control at the beginning of the next end step.";

export default defineCard({
  name: "Golden Argosy",
  manaCost: "{4}",
  colors: [],
  supertypes: ["legendary"],
  types: ["artifact"],
  subtypes: ["Vehicle"],
  power: 3,
  toughness: 6,
  text: `${ATTACK_TEXT}\n${crewText(1)}`,
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "exile-all", filter: { type: "creature", crewedSource: true } },
          {
            kind: "delayed-trigger",
            at: "next-end-step",
            about: "exiled",
            effect: {
              kind: "for-each-target",
              from: 0,
              simultaneous: true,
              effect: { kind: "put-onto-battlefield", target: 0, enterTapped: true },
            },
            text: "Return them to the battlefield tapped under their owner's control.",
          },
        ],
      },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
  activated: [crew(1, crewText(1))],
});
