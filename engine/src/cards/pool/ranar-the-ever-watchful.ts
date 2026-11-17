import { defineCard } from "../define.js";

// EDHREC rank 12158; top-1000 commander #861.
//
// Rulings:
//   "The first card you foretell" refers to the first one you exile from your hand as part of the
//     foretell special action. It doesn't refer to a foretold spell you cast from exile.
//   Ranar's triggered ability triggers only once for each time you exile cards from your hand or
//     permanents from the battlefield, no matter how many objects were exiled at the same time.
//   Ranar's triggered ability will trigger when a spell or ability you control exiles any
//     permanent, including token permanents and permanents you don't control.
//   Its triggered ability doesn't care which player is exiling cards from your hand; permanents
//     exiled from the battlefield cause it to trigger if you controlled the spell or ability.
//
// The trigger is one ability written as two entries (`sameAbilityAs`): cards
// put into exile from your hand by anyone, for any reason (a foretell, a
// pitch cost, an opponent's effect), and permanents a resolving spell or
// ability of yours exiles — tokens and other players' too. One move doing
// both triggers it once (`moveAlreadyFired`).
const FIRST_FREE = "The first card you foretell each turn costs {0} to foretell.";
const SPIRITS =
  "Whenever one or more cards are put into exile from your hand or a spell or ability you control exiles one or more permanents from the battlefield, create a 1/1 white Spirit creature token with flying.";

export default defineCard({
  name: "Ranar the Ever-Watchful",
  manaCost: "{2}{W}{U}",
  colors: ["W", "U"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Spirit", "Warrior"],
  power: 2,
  toughness: 3,
  keywords: ["flying", "vigilance"],
  text: `Flying, vigilance\n${FIRST_FREE}\n${SPIRITS}`,
  static: [{ affects: { scope: "self" }, foretelling: { firstEachTurnFree: true }, text: FIRST_FREE }],
  triggered: [
    {
      trigger: { on: "put-into-exile", who: "you", from: ["hand"] },
      targets: [],
      effect: { kind: "create-token", token: "Spirit Token", count: 1 },
      resolve: null,
      text: SPIRITS,
    },
    {
      trigger: { on: "leaves-battlefield", who: "any", to: ["exile"], batched: true, byEffectOf: "you" },
      sameAbilityAs: 0,
      targets: [],
      effect: { kind: "create-token", token: "Spirit Token", count: 1 },
      resolve: null,
      text: SPIRITS,
    },
  ],
});
