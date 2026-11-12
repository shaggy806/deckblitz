import { defineCard } from "../define.js";

// EDHREC rank 11803. Convert is transform (rule 701.28). "If you do" is the
// `this-way` "transformed" condition (B308): no mana when Megatron couldn't
// convert. Marisi's static for the combat prohibition.
const MTMTE = "More Than Meets the Eye {1}{R}{W}{B} (You may cast this card converted for {1}{R}{W}{B}.)";
const NO_COMBAT_SPELLS = "Your opponents can't cast spells during combat.";
const POSTCOMBAT =
  "At the beginning of each of your postcombat main phases, you may convert Megatron. If you do, add {C} for each 1 life your opponents have lost this turn.";

export default defineCard({
  name: "Megatron, Tyrant",
  manaCost: "{3}{R}{W}{B}",
  colors: ["W", "B", "R"],
  supertypes: ["legendary"],
  types: ["artifact", "creature"],
  subtypes: ["Robot"],
  power: 7,
  toughness: 5,
  text: `${MTMTE}\n${NO_COMBAT_SPELLS}\n${POSTCOMBAT}`,
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "turn-structure", duringCombat: true },
      prohibits: [{ act: "cast", who: "opponents" }],
      text: NO_COMBAT_SPELLS,
    },
  ],
  triggered: [
    {
      trigger: { on: "step-begins", step: "postcombat-main", who: "you" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Convert Megatron and add {C} for each 1 life your opponents have lost this turn?",
        effect: {
          kind: "sequence",
          effects: [
            { kind: "transform", target: "source" },
            {
              kind: "conditional",
              condition: { kind: "this-way", what: "transformed" },
              then: { kind: "add-mana", mana: "C", amount: { turnStat: "life-lost", who: "each-opponent" } },
            },
          ],
        },
      },
      resolve: null,
      text: POSTCOMBAT,
    },
  ],
  faces: ["Megatron, Tyrant", "Megatron, Destructive Force"],
  transform: true,
  moreThanMeetsTheEye: { cost: "{1}{R}{W}{B}" },
});
