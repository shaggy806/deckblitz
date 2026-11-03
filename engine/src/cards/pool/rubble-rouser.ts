import { defineCard } from "../define.js";

// Rulings:
//   [2026-03-20] Rubble Rouser's last ability is a mana ability. It doesn't use the stack and can't
//     be responded to.
//   [2026-03-20] When you activate Rubble Rouser's mana ability, it won't deal damage to each opponent
//     right away. Instead, a second "reflexive" ability triggers whenever you activate that ability.
const MANA = "{T}, Exile a card from your graveyard: Add {R}. When you do, this creature deals 1 damage to each opponent.";
const ENTERS = "When this creature enters, you may discard a card. If you do, draw a card.";

export default defineCard({
  name: "Rubble Rouser",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Dwarf", "Sorcerer"],
  power: 1,
  toughness: 4,
  text: `${ENTERS}\n${MANA}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Discard a card to draw a card?",
        effect: {
          kind: "sequence",
          effects: [
            { kind: "discard", target: "you", amount: 1 },
            { kind: "conditional", condition: { kind: "this-way", what: "discarded" }, then: { kind: "draw", amount: 1 } },
          ],
        },
      },
      resolve: null,
      text: ENTERS,
    },
  ],
  activated: [
    {
      cost: { mana: null, tap: true, exileFromGraveyard: { count: 1 } },
      targets: [],
      effect: {
        kind: "add-mana",
        mana: "R",
        amount: 1,
        also: {
          kind: "reflexive-trigger",
          targets: [],
          effect: { kind: "damage", amount: 1, who: "each-opponent" },
          text: "When you do, this creature deals 1 damage to each opponent.",
        },
      },
      resolve: null,
      text: MANA,
    },
  ],
});
