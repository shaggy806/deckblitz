import { defineCard } from "../define.js";

// EDHREC rank 7342.
//
// Rulings:
//   [2024-11-08] To determine a spell's total cost, start with the mana cost (or an alternative
//     cost if another card's effect allows you to pay one instead), add any cost increases (such
//     as kicker), then apply any cost reductions. The spell's mana value remains unchanged, no
//     matter what the total cost to cast it was.
//   [2024-11-08] If you put a permanent with a kicker ability onto the battlefield without casting
//     it, you can't kick it.
//   [2024-11-08] If you copy a kicked spell on the stack, the copy is also kicked. If the copied
//     spell is a permanent spell, the token the copy of that spell becomes when it enters is also
//     kicked.
//   [2024-11-08] If a spell's kicker cost was paid, the spell is "kicked."
//   [2024-11-08] If a card or token enters as a copy of a permanent, the new permanent isn't
//     kicked, even if the original was.
//   [2024-11-08] The kicker ability doesn't let you pay a kicker cost more than once.

export default defineCard({
  name: "Wastescape Battlemage",
  manaCost: "{1}{C}",
  colors: [],
  types: ["creature"],
  subtypes: ["Eldrazi", "Wizard"],
  power: 2,
  toughness: 2,
  text: "Kicker {G} and/or {1}{U}\nWhen you cast this spell, if it was kicked with its {G} kicker, exile target artifact or enchantment an opponent controls.\nWhen you cast this spell, if it was kicked with its {1}{U} kicker, return target creature an opponent controls to its owner's hand.",
  triggered: [
    {
      trigger: { on: "this-cast" },
      targets: [
        {
          kind: "permanent",
          whose: "opponent",
          filter: { typesAnyOf: ["artifact", "enchantment"] },
        },
      ],
      effect: { kind: "exile", target: 0 },
      resolve: null,
      text: "When you cast this spell, if it was kicked with its {G} kicker, exile target artifact or enchantment an opponent controls.",
      condition: { kind: "self-kicked", with: "first" },
    },
    {
      trigger: { on: "this-cast" },
      targets: ["creature-an-opponent-controls"],
      effect: { kind: "return-to-hand", target: 0 },
      resolve: null,
      text: "When you cast this spell, if it was kicked with its {1}{U} kicker, return target creature an opponent controls to its owner's hand.",
      condition: { kind: "self-kicked", with: "second" },
    },
  ],
  kicker: { cost: "{G}", second: "{1}{U}" },
});
