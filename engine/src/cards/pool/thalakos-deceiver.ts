import { defineCard } from "../define.js";

// Stronghold (STH). EDHREC rank 16253.
//
// Rulings:
//   [2013-04-15] An ability that triggers when something "attacks and isn't blocked" triggers in
//     the declare blockers step after blockers are declared if (1) that creature is attacking and
//     (2) no creatures are declared to block it.
//   [2021-03-19] Once a creature has been blocked, that creature remains blocked and will deal and
//     be dealt combat damage even if it gains or loses shadow or if the blocking creature gains or
//     loses shadow.
//
// Goblin Grenadiers' shape: the target is chosen as the trigger goes on the
// stack, the sacrifice offered as it resolves; the control change has no
// duration.

const TEXT =
  "Whenever this creature attacks and isn't blocked, you may sacrifice it. If you do, gain control of target creature.";

export default defineCard({
  name: "Thalakos Deceiver",
  manaCost: "{3}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Thalakos", "Wizard"],
  power: 1,
  toughness: 1,
  keywords: ["shadow"],
  text: `Shadow (This creature can block or be blocked by only creatures with shadow.)\n${TEXT} (This effect lasts indefinitely.)`,
  triggered: [
    {
      trigger: { on: "attacks-unblocked", who: "self" },
      targets: ["creature"],
      effect: {
        kind: "may",
        prompt: "Sacrifice Thalakos Deceiver to gain control of the targeted creature?",
        effect: {
          kind: "sacrifice-source",
          then: { kind: "gain-control", target: 0, untilEndOfTurn: false },
        },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
