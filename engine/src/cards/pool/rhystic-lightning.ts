import { defineCard } from "../define.js";

// EDHREC rank 26856.
//
// An `unless` has no "if they do", so the payer is asked with an
// `each-player-may` (Divert Disaster's shape) as the spell resolves (the
// ruling): `controllerOfTarget` is the targeted permanent's controller, or
// the targeted player themselves. Paying is 2 damage, not paying (or being
// unable to) is 4.

export default defineCard({
  name: "Rhystic Lightning",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["instant"],
  text: "Rhystic Lightning deals 4 damage to any target unless that permanent's controller or that player pays {2}. If they do, Rhystic Lightning deals 2 damage to the permanent or player.",
  targets: ["any-target"],
  effect: {
    kind: "each-player-may",
    who: { controllerOfTarget: 0 },
    options: [{ pay: "{2}", text: "Pay {2}" }],
    ifDid: { kind: "damage", amount: 2, target: 0 },
    ifDidnt: { kind: "damage", amount: 4, target: 0 },
  },
});
