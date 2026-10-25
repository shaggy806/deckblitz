import { defineCard } from "../define.js";

// SCAFFOLD — written by `npm run card:scaffold` from the Oracle snapshot. Not in the
// registry: author each TODO(scaffold), move this file into cards/pool/ (or
// tokens/), then run `npm run gen:cards -w engine`. See cards/AUTHORING.md.
// EDHREC rank 16931.
//
// Rulings:
//   [2014-02-01] If another player gains control of the creature after Crypsis resolves, the
//     creature will have protection from creatures controlled by opponents of its new controller.
//   [2014-02-01] Abilities of creature cards not on the battlefield owned by an opponent can’t
//     target that creature, and damage those cards would deal to the creature is prevented.

export default defineCard({
  name: "Crypsis",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["instant"],
  text: "Target creature you control gains protection from creatures your opponents control until end of turn. Untap it.",
  // TODO(scaffold): Target creature you control gains protection from creatures your opponents control until end of turn.
  // TODO(scaffold): Untap it.
});
