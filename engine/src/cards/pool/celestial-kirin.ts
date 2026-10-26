import { defineCard } from "../define.js";

// EDHREC rank 22021.
//
// Rulings:
//   [2005-06-01] If the Spirit or Arcane spell has {X} in the mana cost, then you use the value of
//     {X} on the stack. For example, Shining Shoal costs {X}{W}{W}. If you choose X = 2, then
//     Shining Shoal’s mana value is 4. Shining Shoal also has an ability that says “You may exile
//     a white card with mana value X from your hand rather than pay Shining Shoal’s mana cost”; if
//     you choose to pay the alternative cost and exile a card with mana value 2, then X is 2 while
//     Shining Shoal is on the stack and its mana value is 4.
//
// The spell's mana value is read off the trigger object — the spell on the
// stack, its {X} included (rule 202.3e) — as the trigger resolves.
const TEXT = "Whenever you cast a Spirit or Arcane spell, destroy all permanents with that spell's mana value.";

export default defineCard({
  name: "Celestial Kirin",
  manaCost: "{2}{W}{W}",
  colors: ["W"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Kirin", "Spirit"],
  power: 3,
  toughness: 3,
  keywords: ["flying"],
  text: `Flying\n${TEXT}`,
  triggered: [
    {
      trigger: {
        on: "cast-spell",
        who: "you",
        filter: { anyOf: [{ subtype: "Spirit" }, { subtype: "Arcane" }] },
      },
      targets: [],
      effect: {
        kind: "destroy-all",
        filter: { manaValue: { op: "eq", n: { amount: { manaValueOf: "trigger-object" } } } },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
