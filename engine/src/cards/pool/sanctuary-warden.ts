import type { EffectSpec } from "../../effects.js";
import { defineCard } from "../define.js";

// EDHREC rank 7844.
//
// Any kind of counter (the ruling): `counter: "any"` is the player's choice of
// permanent and kind.

const SHIELD_TEXT = "This creature enters with two shield counters on it.";
const TRIGGER_TEXT =
  "Whenever this creature enters or attacks, you may remove a counter from a creature or planeswalker you control. If you do, draw a card and create a 1/1 green and white Citizen creature token.";

const REMOVE: EffectSpec = {
  kind: "may",
  prompt: "Remove a counter from a creature or planeswalker you control?",
  effect: {
    kind: "sequence",
    effects: [
      { kind: "remove-counters", from: { typesAnyOf: ["creature", "planeswalker"] }, counter: "any", count: 1 },
      {
        kind: "conditional",
        condition: { kind: "this-way", what: "counters-removed" },
        then: {
          kind: "sequence",
          effects: [
            { kind: "draw", amount: 1 },
            { kind: "create-token", token: "Citizen Token", count: 1 },
          ],
        },
      },
    ],
  },
};

export default defineCard({
  name: "Sanctuary Warden",
  manaCost: "{4}{W}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Angel", "Soldier"],
  power: 5,
  toughness: 5,
  keywords: ["flying"],
  text: `Flying\n${SHIELD_TEXT}\n${TRIGGER_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", counters: { kind: "shield", amount: 2 } },
      text: SHIELD_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: REMOVE,
      resolve: null,
      text: TRIGGER_TEXT,
    },
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: REMOVE,
      resolve: null,
      text: TRIGGER_TEXT,
    },
  ],
});
