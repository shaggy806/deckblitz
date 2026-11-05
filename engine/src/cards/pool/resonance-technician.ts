import { defineCard } from "../define.js";
import { investigate } from "../helpers.js";

// The copy ability's X is the number of artifacts tapped for the cost,
// announced as it's activated, which the target's mana value must equal
// (`tapOthers.count: "x"`; League Guildmage's target).

const ENTER_TEXT = "When this creature enters, you may discard a card. If you do, investigate twice.";
const COPY_TEXT =
  "{T}, Tap X untapped artifacts you control: Copy target instant or sorcery spell you control with mana value X. You may choose new targets for the copy.";

export default defineCard({
  name: "Resonance Technician",
  manaCost: "{3}{U/R}{U/R}",
  colors: ["U", "R"],
  types: ["creature"],
  subtypes: ["Weird", "Detective"],
  power: 4,
  toughness: 4,
  keywords: ["flying"],
  text: `Flying\n${ENTER_TEXT}\n${COPY_TEXT}`,
  activated: [
    {
      cost: { mana: null, tap: true, tapOthers: { count: "x", filter: { type: "artifact", controlledBy: "you" } } },
      targets: [
        {
          kind: "spell",
          whose: "you",
          filter: { typesAnyOf: ["instant", "sorcery"], manaValue: { op: "eq", n: "x" } },
        },
      ],
      effect: { kind: "copy-spell", target: 0, newTargets: true },
      resolve: null,
      text: COPY_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Discard a card to investigate twice?",
        effect: {
          kind: "sequence",
          effects: [
            { kind: "discard", target: "you", amount: 1 },
            {
              kind: "conditional",
              condition: { kind: "this-way", what: "discarded" },
              then: investigate(2),
            },
          ],
        },
      },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
});
