import { defineCard } from "../define.js";

const WATCH_TEXT =
  "Whenever that creature deals combat damage this turn, if this spell was kicked, you gain life equal to that damage.";

export default defineCard({
  name: "Vigorous Charge",
  manaCost: "{G}",
  colors: ["G"],
  types: ["instant"],
  kicker: { cost: "{W}" },
  text: `Kicker {W} (You may pay an additional {W} as you cast this spell.)\nTarget creature gains trample until end of turn. ${WATCH_TEXT}`,
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "grant-keyword", target: 0, keyword: "trample", duration: "end-of-turn" },
      {
        kind: "conditional",
        condition: { kind: "self-kicked" },
        then: {
          kind: "delayed-trigger",
          at: { whenever: { on: "deals-damage", who: "self", combat: true }, watching: 0 },
          effect: { kind: "gain-life", amount: { triggerValue: true } },
          text: WATCH_TEXT,
        },
      },
    ],
  },
});
