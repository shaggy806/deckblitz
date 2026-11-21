import { defineCard } from "../define.js";

// EDHREC rank 18182.
//
// Rulings:
//   [2016-04-08] The spell you cast from your graveyard can target the spell you cast from your
//     hand.
//   [2016-04-08] If the spell you cast from your hand is countered in response to Harness the
//     Storm's triggered ability, you can still cast the target card while the ability is resolving.
//   [2016-04-08] You choose whether to cast the targeted card as the ability resolves. You can't
//     wait to cast it later.
//   [2016-04-08] Because you're paying the spell's costs, you can pay alternative costs and
//     additional costs; a mandatory additional cost must be paid.
//   [2016-04-08] You must choose a target for Harness the Storm's ability (if one exists)
//     immediately after you've cast an instant or sorcery spell.
// The target slot's `sameNameWith: "trigger-object"` reads the spell that
// triggered it as the trigger goes on the stack (rule 603.3d), and again as
// it resolves (608.2b) — from its last known information once it has left
// the stack. The cast is a paid `cast-now` (rule 608.2g): timing ignored,
// every cost paid.

const TEXT =
  "Whenever you cast an instant or sorcery spell from your hand, you may cast target card with the same name as " +
  "that spell from your graveyard. (You still pay its costs.)";

export default defineCard({
  name: "Harness the Storm",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["enchantment"],
  text: TEXT,
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", from: "hand", filter: { typesAnyOf: ["instant", "sorcery"] } },
      targets: [{ kind: "card-in-graveyard", whose: "you", filter: { sameNameWith: "trigger-object" } }],
      effect: { kind: "cast-now", target: 0 },
      resolve: null,
      text: TEXT,
    },
  ],
});
