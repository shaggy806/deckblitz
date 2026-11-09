import { defineCard } from "../define.js";
import { atLevel, CLASS_REMINDER, classLevel } from "../helpers.js";

// EDHREC rank 4246. Level 3 counts the opponents with one or fewer cards in hand
// (`countPlayers` with `where`, each read as that player).

const ENTER_TEXT = "When this Class enters, each opponent discards two cards unless they discard a nonland card.";
const LEVEL2_TEXT = "At the beginning of each opponent's upkeep, if that player has one or fewer cards in hand, they lose 2 life.";
const LEVEL3_TEXT = "At the beginning of your draw step, draw an additional card for each opponent who has one or fewer cards in hand.";

export default defineCard({
  name: "Bandit's Talent",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["enchantment"],
  subtypes: ["Class"],
  text: `${CLASS_REMINDER}\n${ENTER_TEXT}\n{B}: Level 2\n${LEVEL2_TEXT}\n{3}{B}: Level 3\n${LEVEL3_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "discard", target: "each-opponent", amount: 2, unlessOne: { notTypes: ["land"] } },
      resolve: null,
      text: ENTER_TEXT,
    },
    atLevel(2, {
      trigger: { on: "step-begins", step: "upkeep", who: "opponent" },
      condition: { kind: "of-player", player: "active-player", condition: { kind: "hand-size", atMost: 1 } },
      targets: [],
      effect: { kind: "lose-life", amount: 2, who: "active-player" },
      resolve: null,
      text: LEVEL2_TEXT,
    }),
    atLevel(3, {
      trigger: { on: "step-begins", step: "draw", who: "you" },
      targets: [],
      effect: {
        kind: "draw",
        amount: { countPlayers: "each-opponent", where: { kind: "of-player", player: "that-player", condition: { kind: "hand-size", atMost: 1 } } },
      },
      resolve: null,
      text: LEVEL3_TEXT,
    }),
  ],
  activated: [classLevel(2, "{B}"), classLevel(3, "{3}{B}")],
});
