import { defineCard } from "../define.js";

// "For each creature card put into your graveyard this way": the delayed
// ability remembers those cards as it's made (theme 15's captured context),
// so the bonus doesn't change if they leave the graveyard later this turn.
const WATCH_TEXT =
  "Whenever a creature attacks this turn, it gets +1/+0 until end of turn for each creature card put into your graveyard this way.";

export default defineCard({
  name: "Song of Blood",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: `Mill four cards. ${WATCH_TEXT}`,
  targets: [],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "mill", target: "you", amount: 4 },
      {
        kind: "delayed-trigger",
        at: { whenever: { on: "attacks", who: "any", filter: { type: "creature" } } },
        remember: { milled: { set: { thisWay: "put-into-graveyard", who: "you" }, filter: { type: "creature" } } },
        effect: {
          kind: "modify-pt",
          target: "trigger-object",
          power: { aggregate: "count", filter: {}, in: { remembered: "milled" } },
          toughness: 0,
          duration: "end-of-turn",
        },
        text: WATCH_TEXT,
      },
    ],
  },
});
