import { defineCard } from "../define.js";

// EDHREC rank 22286. Rivals of Ixalan.
//
// The two abilities are independent (the rulings): the exile is permanent,
// and the Dinosaur goes to any target opponent, not necessarily the one
// whose creature was exiled.

export default defineCard({
  name: "Baffling End",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["enchantment"],
  text: "When this enchantment enters, exile target creature an opponent controls with mana value 3 or less.\nWhen this enchantment leaves the battlefield, target opponent creates a 3/3 green Dinosaur creature token with trample.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [
        {
          kind: "permanent",
          whose: "opponent",
          filter: { type: "creature", manaValue: { op: "lte", n: 3 } },
        },
      ],
      effect: { kind: "exile", target: 0 },
      resolve: null,
      text: "When this enchantment enters, exile target creature an opponent controls with mana value 3 or less.",
    },
    {
      trigger: { on: "leaves-battlefield", who: "self" },
      targets: ["opponent"],
      effect: { kind: "create-token", token: "Dinosaur Token", count: 1, who: "target-controller" },
      resolve: null,
      text: "When this enchantment leaves the battlefield, target opponent creates a 3/3 green Dinosaur creature token with trample.",
    },
  ],
});
