import { defineCard } from "../define.js";

// EDHREC rank 31557.
//
// Rulings:
//   [2024-11-08] If you copy a kicked spell on the stack, the copy is also kicked. If the copied
//     spell is a permanent spell, the token the copy of that spell becomes when it enters is also
//     kicked.
//   [2024-11-08] The kicker ability doesn't let you pay a kicker cost more than once.
//   [2024-11-08] If a spell's kicker cost was paid, the spell is "kicked."
//   [2024-11-08] To determine a spell's total cost, start with the mana cost (or an alternative
//     cost if another card's effect allows you to pay one instead), add any cost increases (such
//     as kicker), then apply any cost reductions. The spell's mana value remains unchanged, no
//     matter what the total cost to cast it was.
//   [2024-11-08] If a card or token enters as a copy of a permanent, the new permanent isn't
//     kicked, even if the original was.
//   [2024-11-08] If you put a permanent with a kicker ability onto the battlefield without casting
//     it, you can't kick it.

const A_TEXT = "If this creature was kicked with its {1}{R} kicker, it enters with two +1/+1 counters on it and with first strike.";
const B_TEXT = "If this creature was kicked with its {G} kicker, it enters with a +1/+1 counter on it and with trample.";

// "Enters … with [an ability]" is that ability for as long as it stays, as
// Pouncing Wurm's haste: each gated on which kicker was paid (rule 702.33f).
export default defineCard({
  name: "Cetavolver",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Volver"],
  power: 1,
  toughness: 1,
  text: "Kicker {1}{R} and/or {G} (You may pay an additional {1}{R} and/or {G} as you cast this spell.)\nIf this creature was kicked with its {1}{R} kicker, it enters with two +1/+1 counters on it and with first strike.\nIf this creature was kicked with its {G} kicker, it enters with a +1/+1 counter on it and with trample.",
  kicker: { cost: "{1}{R}", second: "{G}" },
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
      condition: { kind: "self-kicked", with: "first" },
      grantKeywords: ["first-strike"],
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
      grantKeywords: ["trample"],
      text: B_TEXT,
    },
  ],
});
