import { defineCard } from "../define.js";

// EDHREC rank 18290. Flagged "Build ASAP".
//
// The numbers are a secret `vote` of `for: { number }`, chosen by you and the
// target opponent (`youAnd`): neither is shown until both are in. Two numbers
// match exactly when yours is both the highest and the lowest chosen. The cards
// are exiled face down and nobody may look at them (the ruling), so `faceDown:
// true`, not the controller-may-look kind. Sacrificing the safe doesn't end the
// link (rule 607.2a): the cards still go to their owners' hands.

const ENTERS_TEXT = "When this artifact enters, exile the top two cards of your library face down.";
const SAFE_TEXT =
  "{1}, {T}: You and target opponent each secretly choose 1, 2, or 3. Then those choices are revealed. If they match, sacrifice this artifact and put all cards exiled with it into their owners' hands. Otherwise, exile the top card of your library face down.";

export default defineCard({
  name: "Expert-Level Safe",
  manaCost: "{2}",
  colors: [],
  types: ["artifact"],
  text: `${ENTERS_TEXT}\n${SAFE_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "exile-from-library", amount: 2, faceDown: true, linked: true },
      resolve: null,
      text: ENTERS_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: "{1}", tap: true },
      targets: ["opponent"],
      effect: {
        kind: "sequence",
        effects: [
          {
            kind: "vote",
            choose: true,
            secret: true,
            who: { youAnd: { target: 0 } },
            for: { number: { min: 1, max: 3 } },
          },
          {
            kind: "conditional",
            condition: {
              kind: "all",
              of: [
                { kind: "voted-number", who: "you", is: "highest" },
                { kind: "voted-number", who: "you", is: "lowest" },
              ],
            },
            then: {
              kind: "sequence",
              effects: [
                { kind: "sacrifice-source" },
                { kind: "return-exiled-by-source", linked: "hand" },
              ],
            },
            else: { kind: "exile-from-library", amount: 1, faceDown: true, linked: true },
          },
        ],
      },
      resolve: null,
      text: SAFE_TEXT,
    },
  ],
});
