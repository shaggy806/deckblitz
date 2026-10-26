import { defineCard } from "../define.js";

// Avacyn Restored (AVR). EDHREC rank 18411. Cavalier of Night's dies trigger,
// mana value 2 or less.
const DIES =
  "When this creature dies, return target creature card with mana value 2 or less from your graveyard to the battlefield.";

export default defineCard({
  name: "Driver of the Dead",
  manaCost: "{3}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Vampire"],
  power: 3,
  toughness: 2,
  text: DIES,
  triggered: [
    {
      trigger: { on: "dies", who: "self" },
      targets: [
        {
          kind: "card-in-graveyard",
          whose: "you",
          filter: { type: "creature", manaValue: { op: "lte", n: 2 } },
        },
      ],
      effect: { kind: "put-onto-battlefield", target: 0, underYourControl: true },
      resolve: null,
      text: DIES,
    },
  ],
});
