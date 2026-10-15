import { defineCard } from "../define.js";

// EDHREC rank 12906.
//
// "If it was a token" asks about the permanent returned this way, as it last
// existed on the battlefield (rule 608.2h): nothing returned (no target, or
// the target gone), no card.

const ENTERS_TEXT =
  "When this creature enters, return up to one other target nonland permanent you control to its owner's hand. If it was a token, draw a card.";

export default defineCard({
  name: "Sunpearl Kirin",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Kirin"],
  power: 2,
  toughness: 1,
  keywords: ["flash", "flying"],
  text: `Flash\nFlying\n${ENTERS_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [
        {
          kind: "optional",
          of: { kind: "other", of: { kind: "permanent", whose: "you", filter: { notTypes: ["land"] } } },
        },
      ],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "return-to-hand", target: 0 },
          {
            kind: "conditional",
            condition: { kind: "this-way", what: "returned-to-hand", filter: { token: true } },
            then: { kind: "draw", amount: 1 },
          },
        ],
      },
      resolve: null,
      text: ENTERS_TEXT,
    },
  ],
});
