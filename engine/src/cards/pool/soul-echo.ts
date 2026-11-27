import { defineCard } from "../define.js";

// EDHREC rank 25348.
//
// The upkeep ability targets an opponent either way, so the sacrifice
// happens only if it resolves (rule 608.2b). The opponent's "may choose" is
// an `each-player-may` with nothing for them to do; a yes sets up, as the
// effect's controller's, a replacement for damage to you until your next
// upkeep begins: each 1 of it removes an echo counter instead (rule 614.1a),
// still replacing it once the counters are gone (the second ruling). Damage
// before it resolves isn't touched (the first ruling). With several, you
// choose which one a damage event goes to (616.1, the third ruling).

const ENTER_TEXT = "This enchantment enters with X echo counters on it.";
const NO_LOSS_TEXT = "You don't lose the game for having 0 or less life.";
const UPKEEP_TEXT =
  "At the beginning of your upkeep, sacrifice this enchantment if there are no echo counters on it. Otherwise, target opponent may choose that for each 1 damage that would be dealt to you until your next upkeep, you remove an echo counter from this enchantment instead.";

export default defineCard({
  name: "Soul Echo",
  manaCost: "{X}{W}{W}",
  colors: ["W"],
  types: ["enchantment"],
  text: `${ENTER_TEXT}\n${NO_LOSS_TEXT}\n${UPKEEP_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", counters: { kind: "echo", amount: "x" } },
      text: ENTER_TEXT,
    },
    { affects: { scope: "self" }, prohibits: [{ act: "lose-game", who: "you", only: "zero-life" }], text: NO_LOSS_TEXT },
  ],
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: ["opponent"],
      effect: {
        kind: "conditional",
        condition: { kind: "self-counters", counter: "echo", compare: { op: "eq", n: 0 } },
        then: { kind: "sacrifice-source" },
        else: {
          kind: "each-player-may",
          who: { target: 0 },
          prompt: "Have each 1 damage that would be dealt to them until their next upkeep remove an echo counter from Soul Echo instead?",
          effect: { kind: "sequence", effects: [] },
          ifDid: {
            kind: "replacement-effect",
            duration: "until-your-next-upkeep",
            replacement: {
              event: "would-deal-damage",
              to: "you",
              instead: { effect: { kind: "remove-counter", target: "source", counter: "echo", amount: "x" } },
            },
          },
        },
      },
      resolve: null,
      text: UPKEEP_TEXT,
    },
  ],
});
