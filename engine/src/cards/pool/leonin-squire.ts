import { defineCard } from "../define.js";

// EDHREC rank 24610.

const TEXT =
  "When this creature enters, return target artifact card with mana value 1 or less from your graveyard to your hand.";

export default defineCard({
  name: "Leonin Squire",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Cat", "Soldier"],
  power: 2,
  toughness: 2,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [
        { kind: "card-in-graveyard", whose: "you", filter: { type: "artifact", manaValue: { op: "lte", n: 1 } } },
      ],
      effect: { kind: "return-to-hand", target: 0, from: "graveyard" },
      resolve: null,
      text: TEXT,
    },
  ],
});
