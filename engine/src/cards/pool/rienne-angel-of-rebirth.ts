import { defineCard } from "../define.js";

// EDHREC rank 7094.
//
// Rulings:
//   [2019-07-12] If Rienne dies at the same time as one or more other multicolored creatures you
//     control, its last ability triggers for each of those creatures.
//   [2019-07-12] If an effect causes a non-multicolored creature to become multicolored and that
//     creature dies, the non-multicolored card will return to its owner's hand.
//   [2019-07-12] If a multicolored creature you control leaves the graveyard after it dies but
//     before the delayed triggered ability resolves, it will not return to its owner's hand.
//   [2019-07-12] If Rienne leaves the battlefield after its ability has triggered but before the
//     next end step, its delayed triggered ability will still return the card.
//
// The return is Liesa, Forgotten Archangel's: "it" rides forward on the
// delayed trigger and is found only if it's still the card that died, in its
// owner's graveyard (rule 400.7). Multicolored is read as the creature last
// existed on the battlefield (the second ruling).
const ANTHEM_TEXT = "Other multicolored creatures you control get +1/+0.";
const RETURN_TEXT =
  "Whenever another multicolored creature you control dies, return it to its owner's hand at the beginning of the next end step.";

export default defineCard({
  name: "Rienne, Angel of Rebirth",
  manaCost: "{2}{R}{G}{W}",
  colors: ["W", "R", "G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Angel"],
  power: 5,
  toughness: 4,
  keywords: ["flying"],
  text: `Flying\n${ANTHEM_TEXT}\n${RETURN_TEXT}`,
  static: [
    {
      affects: {
        scope: "filter",
        filter: { type: "creature", controlledBy: "you", multicolored: true },
        excludeSelf: true,
      },
      grantPt: [1, 0],
      text: ANTHEM_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "dies", who: "you-control", otherOnly: true, filter: { type: "creature", multicolored: true } },
      targets: [],
      effect: {
        kind: "delayed-trigger",
        at: "next-end-step",
        effect: { kind: "return-to-hand", target: "trigger-object", from: "graveyard" },
        text: "Return that card to its owner's hand.",
      },
      resolve: null,
      text: RETURN_TEXT,
    },
  ],
});
