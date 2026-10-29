import { defineCard } from "../define.js";

// Rulings:
//   [2020-08-07] Breya can be one of the two artifacts sacrificed to pay the cost of its last
//     ability.

const MODAL_TEXT =
  "{2}, Sacrifice two artifacts: Choose one —\n• Breya deals 3 damage to target player or planeswalker.\n• Target creature gets -4/-4 until end of turn.\n• You gain 5 life.";

export default defineCard({
  name: "Breya, Etherium Shaper",
  manaCost: "{W}{U}{B}{R}",
  colors: ["W", "U", "B", "R"],
  supertypes: ["legendary"],
  types: ["artifact", "creature"],
  subtypes: ["Human"],
  power: 4,
  toughness: 4,
  text: `When Breya enters, create two 1/1 blue Thopter artifact creature tokens with flying.\n${MODAL_TEXT}`,
  activated: [
    {
      // Breya herself may be one of the two (its ruling): no otherOnly.
      cost: { mana: "{2}", tap: false, sacrifice: { filter: { type: "artifact" }, count: 2 } },
      targets: [],
      // Its mode chosen as it's activated, bringing its target (rule 700.2b).
      effect: {
        kind: "modal",
        announced: true,
        minModes: 1,
        maxModes: 1,
        modes: [
          {
            text: "Breya deals 3 damage to target player or planeswalker.",
            targets: ["player-or-planeswalker"],
            effect: { kind: "damage", amount: 3, target: 0 },
          },
          {
            text: "Target creature gets -4/-4 until end of turn.",
            targets: ["creature"],
            effect: { kind: "modify-pt", target: 0, power: -4, toughness: -4, duration: "end-of-turn" },
          },
          { text: "You gain 5 life.", effect: { kind: "gain-life", amount: 5 } },
        ],
      },
      resolve: null,
      text: MODAL_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Blue Thopter Token", count: 2 },
      resolve: null,
      text: "When Breya enters, create two 1/1 blue Thopter artifact creature tokens with flying.",
    },
  ],
});
