import { defineCard } from "../define.js";

// EDHREC rank 17833.
//
// Rulings:
//   Its first ability will only trigger once per combat damage step,
//   regardless of how many creatures it deals damage to (`batched`).
//   Its second ability looks at the entire turn, even if it wasn't on the
//   battlefield for some of it, and sees Clues sacrificed for any reason —
//   any Clue artifact, not only a Clue token.

const DAMAGE_TEXT =
  "Whenever this creature deals damage to one or more creatures, investigate. (Create a Clue token. It's an artifact with \"{2}, Sacrifice this token: Draw a card.\")";
const END_TEXT =
  "At the beginning of each end step, if you sacrificed three or more Clues this turn, you may put a creature card from your hand onto the battlefield.";

export default defineCard({
  name: "Briarbridge Patrol",
  manaCost: "{3}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Human", "Warrior"],
  power: 3,
  toughness: 3,
  text: `${DAMAGE_TEXT}\n${END_TEXT}`,
  triggered: [
    {
      trigger: { on: "deals-damage", who: "self", to: "creature", batched: true },
      targets: [],
      effect: { kind: "create-token", token: "Clue Token", count: 1, investigate: true },
      resolve: null,
      text: DAMAGE_TEXT,
    },
    {
      trigger: { on: "step-begins", step: "end", who: "any" },
      condition: { kind: "turn-history", what: "sacrificed", who: "you", filter: { subtype: "Clue" }, atLeast: 3 },
      targets: [],
      effect: {
        kind: "look-and-choose",
        zone: "hand",
        min: 0,
        max: 1,
        destination: "battlefield",
        leftover: "stay",
        filter: { type: "creature" },
      },
      resolve: null,
      text: END_TEXT,
    },
  ],
});
