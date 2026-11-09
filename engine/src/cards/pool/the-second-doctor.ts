import { defineCard } from "../define.js";

const HOW_CIVIL =
  "How Civil of You — At the beginning of your end step, each player may draw a card. Each opponent who does can't attack you or permanents you control during their next turn.";

// EDHREC rank 3712. Each opponent who drew gets the restriction, on their next
// turn alone; you drawing costs nothing.
export default defineCard({
  name: "The Second Doctor",
  manaCost: "{2}{W}{U}",
  colors: ["W", "U"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Time Lord", "Doctor"],
  power: 2,
  toughness: 4,
  text: `Players have no maximum hand size.\n${HOW_CIVIL}`,
  static: [{ affects: { scope: "self" }, noMaxHandSize: "each-player", text: "Players have no maximum hand size." }],
  triggered: [
    {
      trigger: { on: "step-begins", step: "end", who: "you" },
      targets: [],
      effect: {
        kind: "each-player-may",
        who: "each-player",
        prompt: "Draw a card? An opponent who does can't attack this Doctor's controller or their permanents during their next turn.",
        effect: { kind: "draw", amount: 1 },
        resultsFor: "each-opponent",
        ifDid: {
          kind: "restrict",
          filter: { type: "creature", controlledBy: "you" },
          sideOf: "that-player",
          restrictions: [{ kind: "cant-attack", at: "you-and-permanents" }],
          duration: { duringTurnOf: "that-player" },
        },
      },
      resolve: null,
      text: HOW_CIVIL,
    },
  ],
});
