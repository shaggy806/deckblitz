import { defineCard } from "../define.js";

const GRANTED_TEXT =
  "Whenever this creature attacks, create a 1/1 white Soldier creature token that's tapped and attacking.";

export default defineCard({
  name: "Launch the Fleet",
  manaCost: "{W}",
  colors: ["W"],
  types: ["sorcery"],
  text: `Strive — This spell costs {1} more to cast for each target beyond the first.\nUntil end of turn, any number of target creatures each gain "${GRANTED_TEXT}"`,
  costPerExtraTarget: "{1}",
  targets: [{ kind: "any-number", of: "creature" }],
  effect: {
    kind: "for-each-target",
    from: 0,
    effect: {
      kind: "grant-triggered",
      target: 0,
      duration: "end-of-turn",
      ability: {
        trigger: { on: "attacks", who: "self" },
        targets: [],
        effect: { kind: "create-token", token: "Soldier Token", count: 1, tapped: true, attacking: "choose" },
        resolve: null,
        text: GRANTED_TEXT,
      },
    },
  },
});
