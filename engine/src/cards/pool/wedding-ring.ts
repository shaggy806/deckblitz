import { defineCard, type StaticCondition } from "../define.js";

// EDHREC rank 1857. Innistrad: Crimson Vow Commander.
//
// The token enters under the target opponent, a copy of the Ring as it is or
// as it last existed (rule 608.2h). The other two abilities trigger only if
// the player drawing or gaining life controls an artifact named Wedding Ring
// and it's their turn: both are part of the trigger condition (rule 603.1, so
// `whileCondition`), read from that player's side, any Ring of theirs counting
// (the ruling), the token or not.
const ENTERS_TEXT = "When this artifact enters, if it was cast, target opponent creates a token that's a copy of it.";
const DRAWS_TEXT =
  "Whenever an opponent who controls an artifact named Wedding Ring draws a card during their turn, you draw a card.";
const GAINS_TEXT =
  "Whenever an opponent who controls an artifact named Wedding Ring gains life during their turn, you gain that much life.";

const RING_HOLDER_ON_THEIR_TURN: StaticCondition = {
  kind: "of-player",
  player: "that-player",
  condition: {
    kind: "all",
    of: [{ kind: "your-turn" }, { kind: "controls", filter: { type: "artifact", name: "Wedding Ring" }, atLeast: 1 }],
  },
};

export default defineCard({
  name: "Wedding Ring",
  manaCost: "{2}{W}{W}",
  colors: ["W"],
  types: ["artifact"],
  text: `${ENTERS_TEXT}\n${DRAWS_TEXT}\n${GAINS_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self", filter: { cast: true } },
      targets: ["opponent"],
      effect: { kind: "create-token-copy", of: "source", count: 1, who: { target: 0 } },
      resolve: null,
      text: ENTERS_TEXT,
    },
    {
      trigger: { on: "draws", who: "opponent" },
      whileCondition: RING_HOLDER_ON_THEIR_TURN,
      targets: [],
      effect: { kind: "draw", amount: 1 },
      resolve: null,
      text: DRAWS_TEXT,
    },
    {
      trigger: { on: "gains-life", who: "opponent" },
      whileCondition: RING_HOLDER_ON_THEIR_TURN,
      targets: [],
      effect: { kind: "gain-life", amount: { triggerValue: true } },
      resolve: null,
      text: GAINS_TEXT,
    },
  ],
});
