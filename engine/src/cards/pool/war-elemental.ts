import { defineCard } from "../define.js";

// EDHREC rank 13511. Mirrodin.
//
// The enters trigger reads whether some one opponent has been dealt damage
// this turn as it resolves. "Whenever an opponent is dealt damage" is the
// batched damage trigger: once per opponent per simultaneous damage event,
// however many sources dealt it, with the total as "that many".

const ENTERS_TEXT = "When this creature enters, sacrifice it unless an opponent was dealt damage this turn.";
const DAMAGE_TEXT = "Whenever an opponent is dealt damage, put that many +1/+1 counters on this creature.";

export default defineCard({
  name: "War Elemental",
  manaCost: "{R}{R}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Elemental"],
  power: 1,
  toughness: 1,
  text: `${ENTERS_TEXT}\n${DAMAGE_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "conditional",
        condition: { kind: "not", of: { kind: "turn-stat", stat: "damage-taken", who: "opponent", atLeast: 1 } },
        then: { kind: "sacrifice-source" },
      },
      resolve: null,
      text: ENTERS_TEXT,
    },
    {
      trigger: { on: "deals-damage-batch", who: "any", to: "opponent" },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: { triggerValue: true } },
      resolve: null,
      text: DAMAGE_TEXT,
    },
  ],
});
