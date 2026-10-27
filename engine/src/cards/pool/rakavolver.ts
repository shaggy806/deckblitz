import { defineCard } from "../define.js";

// EDHREC rank 31699.
//
// Rulings:
//   [2024-11-08] If a spell's kicker cost was paid, the spell is "kicked."
//   [2024-11-08] The kicker ability doesn't let you pay a kicker cost more than once.
//   [2024-11-08] If you put a permanent with a kicker ability onto the battlefield without casting
//     it, you can't kick it.
//   [2024-11-08] To determine a spell's total cost, start with the mana cost (or an alternative
//     cost if another card's effect allows you to pay one instead), add any cost increases (such
//     as kicker), then apply any cost reductions. The spell's mana value remains unchanged, no
//     matter what the total cost to cast it was.
//   [2024-11-08] If a card or token enters as a copy of a permanent, the new permanent isn't
//     kicked, even if the original was.
//   [2024-11-08] If you copy a kicked spell on the stack, the copy is also kicked. If the copied
//     spell is a permanent spell, the token the copy of that spell becomes when it enters is also
//     kicked.

const A_TEXT = "If this creature was kicked with its {1}{W} kicker, it enters with two +1/+1 counters on it and with \"Whenever this creature deals damage, you gain that much life.\"";
const B_TEXT = "If this creature was kicked with its {U} kicker, it enters with a +1/+1 counter on it and with flying.";

// "Enters … with [an ability]" is that ability for as long as it stays, as
// Pouncing Wurm's haste: each gated on which kicker was paid (rule 702.33f).
export default defineCard({
  name: "Rakavolver",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Volver"],
  power: 2,
  toughness: 2,
  text: "Kicker {1}{W} and/or {U} (You may pay an additional {1}{W} and/or {U} as you cast this spell.)\nIf this creature was kicked with its {1}{W} kicker, it enters with two +1/+1 counters on it and with \"Whenever this creature deals damage, you gain that much life.\"\nIf this creature was kicked with its {U} kicker, it enters with a +1/+1 counter on it and with flying.",
  kicker: { cost: "{1}{W}", second: "{U}" },
  static: [
    {
      affects: { scope: "self" },
      replacement: {
        event: "enters-battlefield",
        counters: { kind: "+1/+1", amount: { ifCondition: { kind: "self-kicked", with: "first" }, then: 2, else: 0 } },
      },
      text: A_TEXT,
    },
    {
      affects: { scope: "self" },
      replacement: {
        event: "enters-battlefield",
        counters: { kind: "+1/+1", amount: { ifCondition: { kind: "self-kicked", with: "second" }, then: 1, else: 0 } },
      },
      text: B_TEXT,
    },
    {
      affects: { scope: "self" },
      condition: { kind: "self-kicked", with: "second" },
      grantKeywords: ["flying"],
      text: B_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "deals-damage", who: "self" },
      condition: { kind: "self-kicked", with: "first" },
      targets: [],
      effect: { kind: "gain-life", amount: { triggerValue: true } },
      resolve: null,
      text: "Whenever this creature deals damage, you gain that much life.",
    },
  ],
});
