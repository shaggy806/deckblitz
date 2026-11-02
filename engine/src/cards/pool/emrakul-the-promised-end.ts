import { defineCard } from "../define.js";

// Rulings:
//   [2025-01-24] If the targeted player skips their next turn, you'll control
//     the next turn they actually take, and the extra turn comes after that one
//     (`extraTurnAfter`, due as that turn ends).
//   [2025-01-24] The cast trigger resolves before the spell, even if the spell
//     is countered.
export default defineCard({
  name: "Emrakul, the Promised End",
  manaCost: "{13}",
  colors: [],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Eldrazi"],
  power: 13,
  toughness: 13,
  keywords: ["flying", "trample"],
  text: "This spell costs {1} less to cast for each card type among cards in your graveyard.\nWhen you cast this spell, you gain control of target opponent during that player's next turn. After that turn, that player takes an extra turn.\nFlying, trample, protection from instants",
  selfCostReduction: {
    // Unconditional: the always-true gate Blasphemous Act uses.
    condition: { kind: "controls", filter: {}, atLeast: 0 },
    reduceGeneric: { cardTypesInGraveyard: { ownedBy: "you" } },
  },
  triggered: [
    {
      trigger: { on: "this-cast" },
      targets: ["opponent"],
      effect: { kind: "control-player", target: 0, extraTurnAfter: true },
      resolve: null,
      text: "When you cast this spell, you gain control of target opponent during that player's next turn. After that turn, that player takes an extra turn.",
    },
  ],
  static: [{ affects: { scope: "self" }, protection: { types: ["instant"] }, text: "Protection from instants" }],
});
