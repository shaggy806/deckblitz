import { defineCard } from "../define.js";

const UPKEEP = "At the beginning of each player's upkeep, that player gains control of this enchantment.";
const GAINED =
  "When you gain control of this enchantment from another player, choose a creature you control and an opponent. Flip a coin. If you lose the flip, that opponent gains control of that creature.";

// Neither choice targets, and the creature's change of control lasts (the
// rulings). Both are made before the flip; which is asked first changes nothing.
export default defineCard({
  name: "Risky Move",
  manaCost: "{3}{R}{R}{R}",
  colors: ["R"],
  types: ["enchantment"],
  text: `${UPKEEP}\n${GAINED}`,
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "any" },
      targets: [],
      effect: { kind: "gain-control", target: "source", untilEndOfTurn: false, who: "active-player" },
      resolve: null,
      text: UPKEEP,
    },
    {
      trigger: { on: "gains-control", who: "self" },
      targets: [],
      effect: {
        kind: "conditional",
        condition: { kind: "controls", filter: { type: "creature" }, atLeast: 1 },
        then: {
          kind: "choose-permanents",
          filter: { type: "creature", controlledBy: "you" },
          upTo: 1,
          min: 1,
          prompt: "Choose a creature you control",
          then: {
            kind: "choose-opponent",
            then: {
              kind: "flip-coin",
              lost: { kind: "gain-control", target: 0, untilEndOfTurn: false, who: "that-player" },
            },
          },
        },
        // No creature to choose: the coin is still flipped, for nothing.
        else: { kind: "flip-coin" },
      },
      resolve: null,
      text: GAINED,
    },
  ],
});
