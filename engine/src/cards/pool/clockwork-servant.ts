import { defineCard } from "../define.js";

// Adamant on three mana of any one colour (`manaSpentOfOneColor`), an
// intervening-if the permanent reads from the spell it was.
const ADAMANT =
  "Adamant — When this creature enters, if at least three mana of the same color was spent to cast it, draw a card.";

export default defineCard({
  name: "Clockwork Servant",
  manaCost: "{3}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Gnome"],
  power: 2,
  toughness: 3,
  text: ADAMANT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      condition: { kind: "source", filter: { manaSpentOfOneColor: 3 } },
      targets: [],
      effect: { kind: "draw", amount: 1 },
      resolve: null,
      text: ADAMANT,
    },
  ],
});
