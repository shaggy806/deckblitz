import { defineCard } from "../define.js";

// Star Trek Commander (TRC). "All Tribbles" is every player's, Koloth's
// controller's own included: the static goads them all, its controller the
// goader (rule 701.15b).

const END_TEXT =
  'At the beginning of your end step, each player creates two 1/1 white Tribble creature tokens with "This token can\'t block."';
const STATIC_TEXT = "All Tribbles get +1/+0 and are goaded.";

export default defineCard({
  name: "Koloth, Tribble Hunter",
  manaCost: "{3}{R}",
  colors: ["R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Klingon", "Warrior", "Officer"],
  power: 3,
  toughness: 3,
  text: `${END_TEXT}\n${STATIC_TEXT} (They attack each combat if able and attack a player other than you if able.)`,
  triggered: [
    {
      trigger: { on: "step-begins", step: "end", who: "you" },
      targets: [],
      effect: { kind: "create-token", token: "Tribble Token", count: 2, who: "each-player" },
      resolve: null,
      text: END_TEXT,
    },
  ],
  static: [
    {
      affects: { scope: "filter", filter: { subtype: "Tribble" } },
      grantPt: [1, 0],
      goads: true,
      text: STATIC_TEXT,
    },
  ],
});
