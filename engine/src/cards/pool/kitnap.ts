import { defineCard } from "../define.js";
import { GIFT_KICKER, giftTrigger } from "../helpers.js";

// EDHREC rank 10822.
//
// Rulings:
//   [2024-07-26] For permanent spells with gift, an ability triggers when that permanent enters if
//     the gift was promised. When that ability resolves, the gift is given to the appropriate
//     opponent.
//   [2024-07-26] If a card or token enters as a copy of a permanent that's already on the
//     battlefield, the gift isn't promised for that new permanent, even if it was promised for the
//     original.
//
// Gift a card (`GIFT_KICKER` + `giftTrigger`); "if the gift wasn't promised" is
// the Aura's own spell not kicked; Control Magic's `controlEnchanted`.

const ENTERS =
  "When this Aura enters, tap enchanted creature. If the gift wasn't promised, put three stun counters on it.";

export default defineCard({
  name: "Kitnap",
  manaCost: "{2}{U}{U}",
  colors: ["U"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Gift a card (You may promise an opponent a gift as you cast this spell. If you do, when it enters, they draw a card.)\nEnchant creature\n${ENTERS}\nYou control enchanted creature.`,
  targets: ["creature"],
  kicker: GIFT_KICKER,
  controlEnchanted: true,
  triggered: [
    giftTrigger("card"),
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "tap", target: "attached" },
          {
            kind: "conditional",
            condition: { kind: "not", of: { kind: "self-kicked" } },
            then: { kind: "add-counter", target: "attached", counter: "stun", amount: 3 },
          },
        ],
      },
      resolve: null,
      text: ENTERS,
    },
  ],
});
