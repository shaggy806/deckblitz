import { defineCard } from "../define.js";

// Rulings:
//   For the second ability, you choose the target artifact or creature as you activate the
//     ability. You choose whether to sacrifice an artifact and which artifact to sacrifice as
//     the ability resolves.
//   For the last ability, if you choose an artifact on the battlefield as the target, and that
//     artifact is no longer on the battlefield as the ability tries to resolve, the ability won't
//     resolve and none of its effects will happen, even if the card is now in a graveyard.
//
// The −1's target is chosen on activation and the sacrifice offered as it resolves (Benthic
// Criminologists' each-player-may, with a target). The −6's slot spans two zones (`one-of`):
// an artifact card in any graveyard or an artifact on the battlefield. A target that changed
// zones is a new object (rule 400.7), so the ability does nothing.
const PLUS = "+1: Create a 1/1 colorless Construct artifact creature token with defender.";
const MINUS = "−1: You may sacrifice an artifact. If you do, destroy target artifact or creature.";
const ULT =
  "−6: Choose target artifact card in a graveyard or artifact on the battlefield. Create three tokens that are copies of it.";

export default defineCard({
  name: "Daretti, Ingenious Iconoclast",
  manaCost: "{1}{B}{R}",
  colors: ["B", "R"],
  supertypes: ["legendary"],
  types: ["planeswalker"],
  subtypes: ["Daretti"],
  loyalty: 3,
  text: `${PLUS}\n${MINUS}\n${ULT}`,
  activated: [
    {
      loyaltyCost: 1,
      cost: { mana: null, tap: false },
      targets: [],
      effect: { kind: "create-token", token: "Construct Token (Defender)", count: 1 },
      resolve: null,
      text: PLUS,
    },
    {
      loyaltyCost: -1,
      cost: { mana: null, tap: false },
      targets: [{ kind: "permanent", filter: { typesAnyOf: ["artifact", "creature"] } }],
      effect: {
        kind: "each-player-may",
        who: "you",
        options: [{ sacrifice: { type: "artifact" }, text: "Sacrifice an artifact" }],
        ifDid: { kind: "destroy", target: 0 },
      },
      resolve: null,
      text: MINUS,
    },
    {
      loyaltyCost: -6,
      cost: { mana: null, tap: false },
      targets: [
        {
          kind: "one-of",
          of: [
            { kind: "card-in-graveyard", whose: "any", filter: { type: "artifact" } },
            { kind: "permanent", filter: { type: "artifact" } },
          ],
        },
      ],
      effect: { kind: "create-token-copy", of: 0, count: 3, who: "you" },
      resolve: null,
      text: ULT,
    },
  ],
});
