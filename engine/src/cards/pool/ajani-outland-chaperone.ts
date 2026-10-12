import { defineCard } from "../define.js";

// EDHREC rank 10687.
//
// Rulings:
//   [2025-11-17] An Aura being put onto the battlefield this way can't enchant anything else that
//     is being put onto the battlefield at the same time.
//   [2025-11-17] If a card in a library has {X} in its mana cost, X is 0 for the purpose of
//     determining its mana value.
//   [2025-11-17] If an Aura is put onto the battlefield without being cast, the Aura's
//     controller-to-be chooses what it will enchant as it enters the battlefield. An Aura put onto
//     the battlefield this way doesn't target anything (so it could be attached to an opponent's
//     permanent with hexproof, for example), but the Aura's enchant ability restricts what it can
//     be attached to. If the Aura can't legally be attached to anything, it remains in its current
//     zone.
//
// The −8 is Genesis Hydra's look with the count read off Ajani's
// controller's life total as it resolves: nothing is revealed, the cards not
// taken stay where they are, and the library is shuffled.
const MINUS_EIGHT_TEXT =
  "−8: Look at the top X cards of your library, where X is your life total. You may put any number of nonland permanent cards with mana value 3 or less from among them onto the battlefield. Then shuffle.";

export default defineCard({
  name: "Ajani, Outland Chaperone",
  manaCost: "{1}{W}{W}",
  colors: ["W"],
  supertypes: ["legendary"],
  types: ["planeswalker"],
  subtypes: ["Ajani"],
  loyalty: 3,
  text: `+1: Create a 1/1 green and white Kithkin creature token.\n−2: Ajani deals 4 damage to target tapped creature.\n${MINUS_EIGHT_TEXT}`,
  activated: [
    {
      loyaltyCost: 1,
      cost: { mana: null, tap: false },
      targets: [],
      effect: { kind: "create-token", token: "Kithkin Token", count: 1 },
      resolve: null,
      text: "+1: Create a 1/1 green and white Kithkin creature token.",
    },
    {
      loyaltyCost: -2,
      cost: { mana: null, tap: false },
      targets: [{ kind: "permanent", filter: { tapped: true, type: "creature" } }],
      effect: { kind: "damage", amount: 4, target: 0 },
      resolve: null,
      text: "−2: Ajani deals 4 damage to target tapped creature.",
    },
    {
      loyaltyCost: -8,
      cost: { mana: null, tap: false },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          {
            kind: "look-and-choose",
            zone: "library",
            count: { lifeTotal: "you" },
            min: 0,
            max: { lifeTotal: "you" },
            filter: {
              typesAnyOf: ["artifact", "creature", "enchantment", "planeswalker", "battle"],
              notTypes: ["land"],
              manaValue: { op: "lte", n: 3 },
            },
            destination: "battlefield",
            leftover: "stay",
          },
          { kind: "shuffle-library" },
        ],
      },
      resolve: null,
      text: MINUS_EIGHT_TEXT,
    },
  ],
});
