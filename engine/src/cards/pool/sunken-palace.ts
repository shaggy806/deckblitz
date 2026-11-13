import { defineCard } from "../define.js";

// EDHREC rank 4621.
//
// Rulings:
//   [2024-06-07] The copy is created on the stack, so it's not "cast" or "activated." Creating the
//     copy won't cause abilities that trigger when a player casts a spell or activates an ability
//     to trigger.
//   [2024-06-07] Resolving copies of permanent spells become tokens as they enter the battlefield.
//     These tokens are not considered "created" when this happens.
//   [2024-06-07] The controller of a copy can't choose to pay any alternative or additional costs
//     for the copy. However, effects based on any alternative or additional costs that were paid
//     for the original spell are copied as though those same costs were paid for the copy.
//   [2024-06-07] The copy will have the same targets as the spell or ability it's copying unless
//     you choose new ones. You may change any number of the targets, including all of them or none
//     of them. If the spell is a permanent spell with targets, such as an Aura, you may also
//     choose a new target for that spell. The new targets must be legal. If, for any target, you
//     can't choose a new legal target, then it remains unchanged (even if the current target is
//     illegal).
//   [2024-06-07] If the spell or ability that's copied is modal (that is, it says "Choose one —"
//     or the like), the copy will have the same mode or modes. You can't choose different ones.
//   [2024-06-07] If the spell or ability has damage divided as it was cast or activated, the
//     division can't be changed (although the targets receiving that damage still can). The same
//     is true of spells and abilities that distribute counters.
//   [2024-06-07] Activated abilities contain a colon. They're generally written "[Cost]:
//     [Effect]." Some keyword abilities are activated abilities and will have a colon in their
//     reminder text.
//   [2024-06-07] A copy is created even if the spell or ability that caused the delayed triggered
//     ability to trigger has been countered by the time that delayed triggered ability resolves.
//     The copy resolves before the original spell.
//   [2024-06-07] If the spell or ability that's copied has an X whose value was determined as it
//     was cast or activated, the copy will have the same value of X.

export default defineCard({
  name: "Sunken Palace",
  colors: [],
  types: ["land"],
  subtypes: ["Cave"],
  text: "This land enters tapped.\n{T}: Add {U}.\n{1}{U}, {T}, Exile seven cards from your graveyard: Add {U}. When you spend this mana to cast a spell or activate an ability, copy that spell or ability. You may choose new targets for the copy. (Mana abilities can't be copied.)",
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "add-mana", mana: "U", amount: 1 },
      resolve: null,
      text: "{T}: Add {U}.",
    },
    {
      // The rider rides on the mana (`whenSpent`): it fires as the {U} pays
      // for a spell or an activated ability, and copies that one — each
      // copy effect does nothing for the other kind, and a mana ability
      // paid with it isn't on the stack to copy.
      cost: { mana: "{1}{U}", tap: true, exileFromGraveyard: { count: 7 } },
      targets: [],
      effect: {
        kind: "add-mana",
        mana: "U",
        amount: 1,
        whenSpent: {
          orAbility: true,
          effect: {
            kind: "sequence",
            effects: [
              { kind: "copy-spell", target: "trigger-spell", newTargets: true },
              { kind: "copy-ability", target: "trigger-ability", newTargets: true },
            ],
          },
          text: "When you spend this mana to cast a spell or activate an ability, copy that spell or ability. You may choose new targets for the copy.",
        },
      },
      resolve: null,
      text: "{1}{U}, {T}, Exile seven cards from your graveyard: Add {U}. When you spend this mana to cast a spell or activate an ability, copy that spell or ability. You may choose new targets for the copy. (Mana abilities can't be copied.)",
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", tapped: true },
      text: "This land enters tapped.",
    },
  ],
});
