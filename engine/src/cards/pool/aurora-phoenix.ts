import { defineCard } from "../define.js";

// EDHREC rank 5058.
//
// Rulings:
//   Aurora Phoenix's last ability triggers only if it's in your graveyard immediately after you
//     finish casting the spell with cascade.
//   The cascade ability of the spell you cast and Aurora Phoenix's return ability can be put on
//     the stack in either order.
//
// "A spell with cascade" is `spellHas: "cascade"`: the spell's own abilities as it's cast, printed
// or granted (rule 702.85a). Cast itself, the Phoenix is on the stack, so only its cascade triggers.

const RETURN = "Whenever you cast a spell with cascade, return this card from your graveyard to your hand.";

export default defineCard({
  name: "Aurora Phoenix",
  manaCost: "{4}{R}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Phoenix"],
  power: 5,
  toughness: 3,
  keywords: ["flying"],
  text: `Flying\nCascade (When you cast this spell, exile cards from the top of your library until you exile a nonland card that costs less. You may cast it without paying its mana cost. Put the exiled cards on the bottom in a random order.)\n${RETURN}`,
  triggered: [
    {
      trigger: { on: "this-cast" },
      targets: [],
      effect: { kind: "cascade" },
      resolve: null,
      text: "Cascade.",
    },
    {
      fromGraveyard: true,
      trigger: { on: "cast-spell", who: "you", spellHas: "cascade" },
      condition: { kind: "source-zone", zones: ["graveyard"], sameObject: true },
      targets: [],
      effect: { kind: "return-to-hand", target: "source", from: "graveyard" },
      resolve: null,
      text: RETURN,
    },
  ],
});
