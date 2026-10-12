import { defineCard } from "../define.js";

// EDHREC rank 7174.
//
// Rulings:
//   [2025-10-02] Momo, Friendly Flier's second ability only reduces the generic mana cost of the
//     spell. If first non-Lemur creature spell with flying you cast on your turn doesn't have
//     generic mana in its cost, the cost will not be reduced and the cost reduction will not apply
//     to the next spell you cast that turn.

export default defineCard({
  name: "Momo, Friendly Flier",
  manaCost: "{W}",
  colors: ["W"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Lemur", "Bat", "Ally"],
  power: 1,
  toughness: 1,
  keywords: ["flying"],
  text: "Flying\nThe first non-Lemur creature spell with flying you cast during each of your turns costs {1} less to cast.\nWhenever another creature you control with flying enters, Momo gets +1/+1 until end of turn.",
  static: [
    {
      affects: { scope: "self" },
      // "During each of your turns": only while it's your turn. The first
      // matching spell uses the discount up whether or not it had generic
      // mana to take it from (the ruling).
      condition: { kind: "your-turn" },
      costModification: {
        applies: { type: "creature", keyword: "flying", notSubtypes: ["Lemur"] },
        caster: "you",
        reduceGeneric: 1,
        firstEachTurn: true,
      },
      text: "The first non-Lemur creature spell with flying you cast during each of your turns costs {1} less to cast.",
    },
  ],
  triggered: [
    {
      trigger: {
        on: "enters-battlefield",
        who: "you-control",
        filter: { type: "creature", keyword: "flying" },
        otherOnly: true,
      },
      targets: [],
      effect: { kind: "modify-pt", target: "source", power: 1, toughness: 1, duration: "end-of-turn" },
      resolve: null,
      text: "Whenever another creature you control with flying enters, Momo gets +1/+1 until end of turn.",
    },
  ],
});
