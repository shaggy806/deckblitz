import { defineCard } from "../define.js";

const UPKEEP_TEXT = "At the beginning of your upkeep, scry 2.";
const BOTTOM_TEXT =
  "Whenever you choose to put one or more cards on the bottom of your library while scrying, exile that many cards from the bottom of your library.";
const PLAY_TEXT = "During your turn, you may play cards exiled with The Temporal Anchor.";

export default defineCard({
  name: "The Temporal Anchor",
  manaCost: "{3}{U}{U}{U}",
  colors: ["U"],
  supertypes: ["legendary"],
  types: ["artifact"],
  text: `${UPKEEP_TEXT}\n${BOTTOM_TEXT}\n${PLAY_TEXT}`,
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: { kind: "scry", amount: 2 },
      resolve: null,
      text: UPKEEP_TEXT,
    },
    {
      // Any scry of yours, not only this one's (rule 701.22a); "that many" is
      // how many went to the bottom. The cards just bottomed are likely among
      // those exiled (the rulings).
      trigger: { on: "event", event: "scry-bottoms", who: "you" },
      targets: [],
      effect: { kind: "exile-from-library", amount: { triggerValue: true }, fromBottom: true, linked: true },
      resolve: null,
      text: BOTTOM_TEXT,
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      mayPlay: { from: "exile", play: true, filter: {}, linked: true, yourTurnOnly: true },
      text: PLAY_TEXT,
    },
  ],
});
