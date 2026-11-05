import { defineCard } from "../define.js";

// EDHREC rank 17042.
//
// "That spell's mana value" is read off the spell as it was on the stack (its
// chosen {X} counted — the ruling), as Celestial Kirin reads it.

const TEXT =
  "Whenever you cast a Spirit or Arcane spell, target player reveals their hand and discards all cards with that spell's mana value.";

export default defineCard({
  name: "Infernal Kirin",
  manaCost: "{2}{B}{B}",
  colors: ["B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Kirin", "Spirit"],
  power: 3,
  toughness: 3,
  keywords: ["flying"],
  text: `Flying\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", filter: { anyOf: [{ subtype: "Spirit" }, { subtype: "Arcane" }] } },
      targets: ["player"],
      effect: {
        kind: "discard-hand",
        who: 0,
        reveal: true,
        filter: { manaValue: { op: "eq", n: { amount: { manaValueOf: "trigger-object" } } } },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
