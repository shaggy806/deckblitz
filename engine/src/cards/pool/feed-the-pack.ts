import { defineCard } from "../define.js";

// EDHREC rank 11295.
//
// Rulings:
//   [2011-01-22] You choose whether to sacrifice a nontoken creature and which creature to
//     sacrifice when Feed the Pack’s ability resolves.
//   [2011-01-22] Check the sacrificed creature’s toughness as it last existed on the battlefield
//     to determine how many Wolves you put onto the battlefield.
//
// The sacrifice is made as the trigger resolves (an `each-player-may` option),
// and its follow-up reads that creature as `"sacrificed"`, last known on the
// battlefield (rule 608.2h — the second ruling).

const TEXT =
  "At the beginning of your end step, you may sacrifice a nontoken creature. If you do, create X 2/2 green Wolf creature tokens, where X is the sacrificed creature's toughness.";

export default defineCard({
  name: "Feed the Pack",
  manaCost: "{5}{G}",
  colors: ["G"],
  types: ["enchantment"],
  text: TEXT,
  triggered: [
    {
      trigger: { on: "step-begins", step: "end", who: "you" },
      targets: [],
      effect: {
        kind: "each-player-may",
        who: "you",
        options: [{ sacrifice: { type: "creature", token: false }, text: "Sacrifice a nontoken creature" }],
        ifDid: { kind: "create-token", token: "Wolf Token", count: { toughnessOf: "sacrificed" } },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
