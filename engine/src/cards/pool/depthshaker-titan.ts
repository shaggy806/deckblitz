import { defineCard } from "../define.js";
import { melee } from "../helpers.js";

// The artifacts become 3/3 creatures indefinitely (base P/T set, so a
// Vehicle crewed later stays 3/3 — the ruling), and the delayed trigger
// sacrifices those same objects, whatever they are by then.

const ENTER_TEXT =
  "When this creature enters, any number of target noncreature artifacts you control become 3/3 artifact creatures. Sacrifice them at the beginning of the next end step.";
const GRANT_TEXT =
  "Each artifact creature you control has melee, trample, and haste. (Whenever a creature with melee attacks, it gets +1/+1 until end of turn for each opponent you attacked this combat.)";

export default defineCard({
  name: "Depthshaker Titan",
  manaCost: "{5}{R}{R}",
  colors: ["R"],
  types: ["artifact", "creature"],
  subtypes: ["Robot"],
  power: 5,
  toughness: 5,
  text: `${ENTER_TEXT}\n${GRANT_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [
        {
          kind: "any-number",
          of: { kind: "permanent", whose: "you", filter: { type: "artifact", notTypes: ["creature"] } },
        },
      ],
      effect: {
        kind: "sequence",
        effects: [
          {
            kind: "for-each-target",
            from: 0,
            effect: {
              kind: "animate",
              target: 0,
              power: 3,
              toughness: 3,
              addTypes: ["artifact", "creature"],
              addSubtypes: [],
              duration: "permanent",
            },
          },
          {
            kind: "delayed-trigger",
            at: "next-end-step",
            effect: {
              kind: "for-each-target",
              from: 0,
              simultaneous: true,
              effect: { kind: "sacrifice-target", target: 0 },
            },
            text: "Sacrifice them.",
          },
        ],
      },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
  static: [
    {
      affects: { scope: "filter", filter: { types: ["artifact", "creature"], controlledBy: "you" } },
      grantKeywords: ["trample", "haste"],
      grantsTriggered: [melee()],
      text: GRANT_TEXT,
    },
  ],
});
