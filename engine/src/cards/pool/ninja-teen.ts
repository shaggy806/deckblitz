import { defineCard } from "../define.js";
import { atLevel, classLevel } from "../helpers.js";

// EDHREC rank 6767. A Class (rule 716). At level 3 the creature cards in your
// graveyard have sneak, and you may cast them from there with it: the one this
// gives them, or their own.
const LEAVES_TEXT = "Whenever a creature you control leaves the battlefield, each opponent loses 1 life.";
const LEVEL_2_TEXT = "Creatures you control get +1/+0 and have menace.";
const LEVEL_3_HAS_TEXT = "Creature cards in your graveyard have sneak {3}{B}.";
const LEVEL_3_CAST_TEXT = "You may cast creature spells from your graveyard using their sneak abilities.";

export default defineCard({
  name: "Ninja Teen",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["enchantment"],
  subtypes: ["Class"],
  text: `(Gain the next level as a sorcery to add its ability.)\n${LEAVES_TEXT}\n{1}{B}: Level 2\n${LEVEL_2_TEXT}\n{B}: Level 3\n${LEVEL_3_HAS_TEXT}\n${LEVEL_3_CAST_TEXT}`,
  static: [
    atLevel(2, {
      affects: { scope: "creatures-you-control" },
      grantPt: [1, 0],
      grantKeywords: ["menace"],
      text: LEVEL_2_TEXT,
    }),
    atLevel(3, {
      affects: { scope: "self" },
      grantsToGraveyard: { filter: { type: "creature" }, keywords: [{ keyword: "sneak", cost: "{3}{B}" }] },
      text: LEVEL_3_HAS_TEXT,
    }),
    atLevel(3, {
      affects: { scope: "self" },
      castWithSneakFromGraveyard: { filter: { type: "creature" } },
      text: LEVEL_3_CAST_TEXT,
    }),
  ],
  triggered: [
    {
      trigger: { on: "leaves-battlefield", who: "you-control", filter: { type: "creature" } },
      targets: [],
      effect: { kind: "lose-life", amount: 1, who: "each-opponent" },
      resolve: null,
      text: LEAVES_TEXT,
    },
  ],
  activated: [classLevel(2, "{1}{B}"), classLevel(3, "{B}")],
});
