import { defineCard } from "../define.js";

// The Hobbit (HOB). EDHREC rank 8200.
//
// Rulings:
//   [2026-06-29] The type-changing effect of the triggered ability lasts indefinitely. It doesn't
//     wear off during the cleanup step or when Beorn the Fierce leaves the battlefield. The
//     creature couldn't bear not being a Bear!
//
// "Three or more Bears" is any Bear permanents you control, counted after the
// target has become one. With no target chosen the ability still resolves
// and may draw; a chosen target gone illegal stops all of it (rule 608.2b).

const ANTHEM_TEXT = "Other Bears you control get +2/+2.";
const COMBAT_TEXT =
  "At the beginning of combat on your turn, put a trample counter on up to one target creature you control. It becomes a Bear in addition to its other types. Then if you control three or more Bears, draw two cards.";

export default defineCard({
  name: "Beorn the Fierce",
  manaCost: "{3}{G}{G}",
  colors: ["G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Bear", "Shapeshifter", "Warrior"],
  power: 6,
  toughness: 6,
  keywords: ["trample"],
  text: `Trample\n${ANTHEM_TEXT}\n${COMBAT_TEXT}`,
  static: [
    {
      affects: { scope: "filter", filter: { subtype: "Bear", controlledBy: "you" }, excludeSelf: true },
      grantPt: [2, 2],
      text: ANTHEM_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "step-begins", step: "begin-combat", who: "you" },
      targets: [{ kind: "optional", of: "creature-you-control" }],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "add-counter", target: 0, counter: "trample", amount: 1 },
          { kind: "add-types", target: 0, addSubtypes: ["Bear"], duration: "permanent" },
          {
            kind: "conditional",
            condition: { kind: "controls", filter: { subtype: "Bear" }, atLeast: 3 },
            then: { kind: "draw", amount: 2 },
          },
        ],
      },
      resolve: null,
      text: COMBAT_TEXT,
    },
  ],
});
