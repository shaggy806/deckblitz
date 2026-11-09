import { defineCard } from "../define.js";

// Aurelia's Vindicator's targets and link. The "you may" is answered as it
// resolves, the targets having been chosen as it went on the stack (its ruling).
const ENTER_TEXT =
  "When this creature enters, you may exile up to three other target creatures from the battlefield and/or creature cards from graveyards.";
const LEAVE_TEXT = "When this creature leaves the battlefield, return the exiled cards to their owners' hands.";

export default defineCard({
  name: "Angel of Serenity",
  manaCost: "{4}{W}{W}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Angel"],
  power: 5,
  toughness: 6,
  keywords: ["flying"],
  text: `Flying\n${ENTER_TEXT}\n${LEAVE_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [
        {
          kind: "any-number",
          of: {
            kind: "other",
            of: {
              kind: "one-of",
              of: ["creature", { kind: "card-in-graveyard", whose: "any", filter: { type: "creature" } }],
            },
          },
          max: 3,
        },
      ],
      effect: {
        kind: "may",
        prompt: "Exile the targets?",
        effect: { kind: "for-each-target", from: 0, simultaneous: true, effect: { kind: "exile", target: 0, linked: true } },
      },
      resolve: null,
      text: ENTER_TEXT,
    },
    {
      trigger: { on: "leaves-battlefield", who: "self" },
      targets: [],
      effect: { kind: "return-exiled-by-source", linked: "hand" },
      resolve: null,
      text: LEAVE_TEXT,
    },
  ],
});
