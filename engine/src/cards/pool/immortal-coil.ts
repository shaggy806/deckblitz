import { defineCard } from "../define.js";

// All damage to you is prevented however few cards are in your graveyard
// (the ruling); you exile as many as there are, up to the damage prevented.
// The state trigger checks only as it triggers, and you lose as it resolves
// (the ruling).
export default defineCard({
  name: "Immortal Coil",
  manaCost: "{2}{B}{B}",
  colors: ["B"],
  types: ["artifact"],
  text: "{T}, Exile two cards from your graveyard: Draw a card.\nIf damage would be dealt to you, prevent that damage. Exile a card from your graveyard for each 1 damage prevented this way.\nWhen there are no cards in your graveyard, you lose the game.",
  activated: [
    {
      cost: { mana: null, tap: true, exileFromGraveyard: { count: 2 } },
      targets: [],
      effect: { kind: "draw", amount: 1 },
      resolve: null,
      text: "{T}, Exile two cards from your graveyard: Draw a card.",
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      replacement: {
        event: "would-deal-damage",
        to: "you",
        prevent: true,
        perEvent: true,
        then: { kind: "look-and-choose", zone: "graveyard", min: "x", max: "x", destination: "exile", leftover: "stay" },
      },
      text: "If damage would be dealt to you, prevent that damage. Exile a card from your graveyard for each 1 damage prevented this way.",
    },
  ],
  triggered: [
    {
      trigger: { on: "state", state: { kind: "not", of: { kind: "cards-in-graveyard", atLeast: 1 } } },
      targets: [],
      effect: { kind: "lose-game" },
      resolve: null,
      text: "When there are no cards in your graveyard, you lose the game.",
    },
  ],
});
