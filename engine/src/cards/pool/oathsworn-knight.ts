import { defineCard } from "../define.js";

// EDHREC rank 19685.
//
// Rulings:
//   If damage that can't be prevented is dealt to Oathsworn Knight, one counter is still removed
//     from it.
//   If multiple sources would deal damage to Oathsworn Knight simultaneously (for example,
//     multiple creatures blocking it), its last ability applies once. All of that damage is
//     prevented, and only one counter is removed.
//   Oathsworn Knight's last ability removes only one counter from it each time it would be dealt
//     damage, not one counter per 1 damage prevented.
//
// Unbreathing Horde's prevention, active while a +1/+1 counter is on it;
// simultaneous damage is one event, so one counter goes (`Game.preventedThisEvent`).
// No damage in the engine is unpreventable yet, so the first ruling can't arise.
const ENTER_TEXT = "This creature enters with four +1/+1 counters on it.";
const ATTACK_TEXT = "This creature attacks each combat if able.";
const PREVENT_TEXT =
  "If damage would be dealt to this creature while it has a +1/+1 counter on it, prevent that damage and remove a +1/+1 counter from it.";

export default defineCard({
  name: "Oathsworn Knight",
  manaCost: "{1}{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Human", "Knight"],
  power: 0,
  toughness: 0,
  text: `${ENTER_TEXT}\n${ATTACK_TEXT}\n${PREVENT_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", counters: { kind: "+1/+1", amount: 4 } },
      text: ENTER_TEXT,
    },
    { affects: { scope: "self" }, restrictions: ["must-attack"], text: ATTACK_TEXT },
    {
      affects: { scope: "self" },
      condition: { kind: "self-counters", counter: "+1/+1", compare: { op: "gte", n: 1 } },
      replacement: {
        event: "would-deal-damage",
        prevent: true,
        perEvent: true,
        to: "self",
        then: { kind: "remove-counter", target: "source", counter: "+1/+1", amount: 1 },
      },
      text: PREVENT_TEXT,
    },
  ],
});
