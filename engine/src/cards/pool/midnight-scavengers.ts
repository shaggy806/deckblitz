import { defineCard } from "../define.js";

const ENTER_TEXT =
  "When this creature enters, you may return target creature card with mana value 3 or less from your graveyard to your hand.";

// "(Melds with Graf Rats.)" is reminder text: melding is Graf Rats' ability,
// not this card's (Hanweir Garrison keeps the same line).
export default defineCard({
  name: "Midnight Scavengers",
  manaCost: "{4}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Human", "Rogue"],
  power: 3,
  toughness: 3,
  text: `${ENTER_TEXT}\n(Melds with Graf Rats.)`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [{ kind: "card-in-graveyard", whose: "you", filter: { type: "creature", manaValue: { op: "lte", n: 3 } } }],
      effect: {
        kind: "may",
        prompt: "Return the target creature card to your hand?",
        effect: { kind: "return-to-hand", target: 0, from: "graveyard" },
      },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
});
