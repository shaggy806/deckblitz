import { defineCard } from "../define.js";

// EDHREC rank 16467.
//
// Rulings:
//   [2023-04-14] You don't choose a target for Slumbering Walker's ability at the time it
//     triggers. Rather, a second "reflexive" ability triggers when you remove a counter from
//     Slumbering Walker this way.
//
// The counter removed is one of the controller's choice of kind (it may carry
// +1/+1 or other counters beside its -1/-1s); "when you do" triggers only if
// one came off.
const ENTER_TEXT = "This creature enters with two -1/-1 counters on it.";
const END_TEXT =
  "At the beginning of your end step, you may remove a counter from this creature. When you do, return target creature card with power 2 or less from your graveyard to the battlefield.";

export default defineCard({
  name: "Slumbering Walker",
  manaCost: "{3}{W}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Giant", "Warrior"],
  power: 4,
  toughness: 7,
  text: `${ENTER_TEXT}\n${END_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", counters: { kind: "-1/-1", amount: 2 } },
      text: ENTER_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "step-begins", step: "end", who: "you" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Remove a counter from Slumbering Walker?",
        effect: {
          kind: "sequence",
          effects: [
            { kind: "remove-counters", target: "source", counter: "any", count: 1 },
            {
              kind: "conditional",
              condition: { kind: "this-way", what: "counters-removed" },
              then: {
                kind: "reflexive-trigger",
                targets: [
                  {
                    kind: "card-in-graveyard",
                    whose: "you",
                    filter: { type: "creature", power: { op: "lte", n: 2 } },
                  },
                ],
                effect: { kind: "put-onto-battlefield", target: 0 },
                text: "When you do, return target creature card with power 2 or less from your graveyard to the battlefield.",
              },
            },
          ],
        },
      },
      resolve: null,
      text: END_TEXT,
    },
  ],
});
