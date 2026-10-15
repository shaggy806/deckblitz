import { defineCard } from "../define.js";

// EDHREC rank 26031.
//
// Aerith, Last Ancient's shape: the life-gain clause is read as the ability
// resolves, and picks where the one targeted card goes.

const ETB_TEXT =
  "When Doctor Jane Foster enters, return target creature card with mana value 3 or less from your graveyard to your hand. If you gained life this turn, return that card to the battlefield instead.";

export default defineCard({
  name: "Doctor Jane Foster",
  manaCost: "{3}{W}",
  colors: ["W"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Doctor"],
  power: 2,
  toughness: 3,
  keywords: ["vigilance"],
  text: `Vigilance (Attacking doesn't cause this creature to tap.)\n${ETB_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [
        { kind: "card-in-graveyard", whose: "you", filter: { type: "creature", manaValue: { op: "lte", n: 3 } } },
      ],
      effect: {
        kind: "conditional",
        condition: { kind: "turn-stat", stat: "life-gained", who: "you", atLeast: 1 },
        then: { kind: "put-onto-battlefield", target: 0 },
        else: { kind: "return-to-hand", target: 0, from: "graveyard" },
      },
      resolve: null,
      text: ETB_TEXT,
    },
  ],
});
