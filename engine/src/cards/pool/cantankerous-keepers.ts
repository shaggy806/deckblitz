import { defineCard } from "../define.js";
import { affinity } from "../helpers.js";

// EDHREC rank 16372.
//
// Rulings:
//   [2026-06-29] To determine the total cost of a spell, start with the mana cost or alternative
//     cost you're paying, add any cost increases, then apply any cost reductions (such as that of
//     Cantankerous Keepers's first ability). The mana value of the spell is determined only by its
//     mana cost, no matter what the total cost to cast that spell was.
//   [2026-06-29] Affinity for Elves reduces only the generic mana in the cost to cast Cantankerous
//     Keepers. The colored mana must still be paid.
// "Put all Elf cards from among them": a look-and-choose whose min and max are every card milled
// (clamped to the Elves among them), so each one goes and none can be left (Marina Vendrell's shape).

const ETB_TEXT = "When this creature enters, mill four cards, then put all Elf cards from among them into your hand.";

export default defineCard({
  name: "Cantankerous Keepers",
  manaCost: "{5}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Elf", "Soldier"],
  power: 4,
  toughness: 3,
  text: `Affinity for Elves (This spell costs {1} less to cast for each Elf you control.)\n${ETB_TEXT}`,
  selfCostReduction: affinity({ subtype: "Elf" }),
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "mill", target: "you", amount: 4 },
          {
            kind: "look-and-choose",
            zone: "graveyard",
            min: 4,
            max: 4,
            destination: "hand",
            leftover: "stay",
            filter: { thisWay: "milled", subtype: "Elf" },
          },
        ],
      },
      resolve: null,
      text: ETB_TEXT,
    },
  ],
});
