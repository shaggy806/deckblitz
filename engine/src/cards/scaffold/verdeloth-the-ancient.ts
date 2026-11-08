import { defineCard } from "../define.js";

// SCAFFOLD — written by `npm run card:scaffold` from the Oracle snapshot. Not in the
// registry: author each TODO(scaffold), move this file into cards/pool/ (or
// tokens/), then run `npm run gen:cards -w engine`. See cards/AUTHORING.md.
// EDHREC rank 7726.
// Makes Saproling → use "Saproling Token".
//
// Rulings:
//   [2013-06-07] Verdeloth won't give himself +1/+1 unless he somehow becomes a Saproling.
//   [2024-11-08] If a spell's kicker cost was paid, the spell is "kicked."
//   [2024-11-08] If a card or token enters as a copy of a permanent, the new permanent isn't
//     kicked, even if the original was.
//   [2024-11-08] If you put a permanent with a kicker ability onto the battlefield without casting
//     it, you can't kick it.
//   [2024-11-08] The kicker ability doesn't let you pay a kicker cost more than once.
//   [2024-11-08] To determine a spell's total cost, start with the mana cost (or an alternative
//     cost if another card's effect allows you to pay one instead), add any cost increases (such
//     as kicker), then apply any cost reductions. The spell's mana value remains unchanged, no
//     matter what the total cost to cast it was.
//   [2024-11-08] If you copy a kicked spell on the stack, the copy is also kicked. If the copied
//     spell is a permanent spell, the token the copy of that spell becomes when it enters is also
//     kicked.

export default defineCard({
  name: "Verdeloth the Ancient",
  manaCost: "{4}{G}{G}",
  colors: ["G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Treefolk"],
  power: 4,
  toughness: 7,
  kicker: { cost: "{X}" },
  text: "Kicker {X} (You may pay an additional {X} as you cast this spell.)\nSaproling creatures and other Treefolk creatures get +1/+1.\nWhen Verdeloth enters, if it was kicked, create X 1/1 green Saproling creature tokens.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Saproling Token", count: "x" },
      resolve: null,
      text: "When Verdeloth enters, if it was kicked, create X 1/1 green Saproling creature tokens.",
      condition: { kind: "self-kicked" },
    },
  ],
  // TODO(scaffold): Saproling creatures and other Treefolk creatures get +1/+1.
});
