import { defineCard } from "../define.js";
import { atLevel, classLevel } from "../helpers.js";

// EDHREC rank 7212. A Class (rule 716). Its first ability needn't have seen the
// creature die (the ruling): "a creature died this turn" is turn-wide.
const LEVEL_1 = "At the beginning of your end step, if a creature died this turn, each opponent loses 1 life.";
const LEVEL_2 =
  "When this Class becomes level 2, look at the top three cards of your library. Put one of them into your hand and the rest into your graveyard.";
const LEVEL_3 = "At the beginning of your end step, each opponent loses life equal to the life they lost this turn.";

export default defineCard({
  name: "Warlock Class",
  manaCost: "{B}",
  colors: ["B"],
  types: ["enchantment"],
  subtypes: ["Class"],
  text: `(Gain the next level as a sorcery to add its ability.)\n${LEVEL_1}\n{1}{B}: Level 2\n${LEVEL_2}\n{6}{B}: Level 3\n${LEVEL_3} (Damage causes loss of life.)`,
  triggered: [
    {
      trigger: { on: "step-begins", step: "end", who: "you" },
      condition: { kind: "creature-died-this-turn" },
      targets: [],
      effect: { kind: "lose-life", amount: 1, who: "each-opponent" },
      resolve: null,
      text: LEVEL_1,
    },
    atLevel(2, {
      trigger: { on: "class-level-gained", who: "self", level: 2 },
      targets: [],
      effect: {
        kind: "look-and-choose",
        zone: "library",
        count: 3,
        min: 1,
        max: 1,
        destination: "hand",
        leftover: "graveyard",
      },
      resolve: null,
      text: LEVEL_2,
    }),
    atLevel(3, {
      trigger: { on: "step-begins", step: "end", who: "you" },
      targets: [],
      effect: {
        kind: "for-each-player",
        who: "each-opponent",
        effect: { kind: "lose-life", who: "that-player", amount: { turnStat: "life-lost", who: "that-player" } },
      },
      resolve: null,
      text: LEVEL_3,
    }),
  ],
  activated: [classLevel(2, "{1}{B}"), classLevel(3, "{6}{B}")],
});
