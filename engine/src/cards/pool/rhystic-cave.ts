import { defineCard } from "../define.js";

// EDHREC rank 20257. A mana ability despite "Activate only as an instant"
// (rule 605.1: a timing restriction doesn't stop one being a mana ability),
// so it never uses the stack (605.3b). The colour is chosen as it's
// activated; then each player in turn order from the active player may pay
// {1} (`unlessAnyPlayerPays`), nobody getting priority meanwhile. Activated
// abilities are only offered with priority — instant timing (602.5e) — and
// the auto-payer never uses it, so it can't be activated mid-payment (the
// errata).
//
// Rulings:
//   - Each player, starting with the current player and going in turn order,
//     gets the option to pay as the ability resolves.
//   - If a player pays {1}, Rhystic Cave produces no mana and isn't
//     considered to have been tapped for mana.

const TEXT = "{T}: Choose a color. Add one mana of that color unless any player pays {1}. Activate only as an instant.";

export default defineCard({
  name: "Rhystic Cave",
  colors: [],
  types: ["land"],
  text: TEXT,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "add-mana", mana: "any-color", amount: 1, unlessAnyPlayerPays: "{1}" },
      resolve: null,
      text: TEXT,
    },
  ],
});
