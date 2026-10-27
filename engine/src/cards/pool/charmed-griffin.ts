import { defineCard } from "../define.js";

const TEXT =
  "When this creature enters, each other player may put an artifact or enchantment card onto the battlefield from their hand.";

export default defineCard({
  name: "Charmed Griffin",
  manaCost: "{3}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Griffin"],
  power: 3,
  toughness: 3,
  keywords: ["flying"],
  text: `Flying\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "each-player-may",
        who: "each-opponent",
        options: [
          {
            putFromHand: { typesAnyOf: ["artifact", "enchantment"] },
            text: "Put an artifact or enchantment card from your hand onto the battlefield",
          },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
