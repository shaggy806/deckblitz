import { defineCard } from "../define.js";

// EDHREC rank 7421.
//
// An `unless` has no "if they do", so the spell's controller is asked with an
// `each-player-may` (Arcane Denial's `controllerOfTarget`): paying is `ifDid`,
// the Lander the caster's, and not paying — or being unable to — is `ifDidnt`,
// the counter.

export default defineCard({
  name: "Divert Disaster",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["instant"],
  text: 'Counter target spell unless its controller pays {2}. If they do, you create a Lander token. (It\'s an artifact with "{2}, {T}, Sacrifice this token: Search your library for a basic land card, put it onto the battlefield tapped, then shuffle.")',
  targets: ["spell"],
  effect: {
    kind: "each-player-may",
    who: { controllerOfTarget: 0 },
    options: [{ pay: "{2}", text: "Pay {2}" }],
    ifDid: { kind: "create-token", token: "Lander Token", count: 1 },
    ifDidnt: { kind: "counter", target: 0 },
  },
});
