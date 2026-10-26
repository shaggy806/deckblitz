import { defineCard } from "../define.js";

// EDHREC rank 10426.
//
// Rulings:
//   [2004-10-04] It will trigger "enters" abilities and "leaves the battlefield" abilities. Note
//     that the card does not go to the graveyard, so it will not trigger "goes to the graveyard"
//     abilities.
//   [2005-08-01] This spell effectively "resets" the permanent to being just like it was freshly
//     cast. All counters, Auras, effects, and so on are removed when it is exiled. Then it comes
//     back onto the battlefield like new.

export default defineCard({
  name: "Flicker",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["sorcery"],
  text: "Exile target nontoken permanent, then return it to the battlefield under its owner's control.",
  targets: [{ kind: "permanent", filter: { token: false } }],
  effect: { kind: "flicker", target: 0 },
});
