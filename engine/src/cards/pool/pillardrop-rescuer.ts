import { defineCard } from "../define.js";

// EDHREC rank 23921. Nimraiser Paladin's trigger.
const ETB_TEXT =
  "When this creature enters, return target creature card with mana value 3 or less from your graveyard to your hand.";

export default defineCard({
  name: "Pillardrop Rescuer",
  manaCost: "{4}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Spirit", "Cleric"],
  power: 2,
  toughness: 2,
  keywords: ["flying"],
  text: `Flying\n${ETB_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [
        {
          kind: "card-in-graveyard",
          whose: "you",
          filter: { type: "creature", manaValue: { op: "lte", n: 3 } },
        },
      ],
      effect: { kind: "return-to-hand", target: 0, from: "graveyard" },
      resolve: null,
      text: ETB_TEXT,
    },
  ],
});
