import { defineCard } from "../define.js";

// EDHREC rank 15374.
//
// Doctor Jane Foster's shape: whether you control a Mount is asked as the
// ability resolves. A permanent card is any of the permanent types (the
// ruling); an Aura returned to the battlefield is attached as it enters, not
// targeted (rule 303.4f — the ruling).
const ENTER =
  "When this creature enters, return target permanent card with mana value 3 or less from your graveyard to your hand. Return that card to the battlefield instead if you control a Mount.";

export default defineCard({
  name: "Shepherd of the Clouds",
  manaCost: "{4}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Pegasus"],
  power: 4,
  toughness: 3,
  keywords: ["flying", "vigilance"],
  text: `Flying, vigilance\n${ENTER}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [
        {
          kind: "card-in-graveyard",
          whose: "you",
          filter: {
            typesAnyOf: ["artifact", "creature", "enchantment", "land", "planeswalker", "battle"],
            manaValue: { op: "lte", n: 3 },
          },
        },
      ],
      effect: {
        kind: "conditional",
        condition: { kind: "controls", filter: { subtype: "Mount" }, atLeast: 1 },
        then: { kind: "put-onto-battlefield", target: 0 },
        else: { kind: "return-to-hand", target: 0, from: "graveyard" },
      },
      resolve: null,
      text: ENTER,
    },
  ],
});
