import { defineCard } from "../define.js";
import { prowl } from "../helpers.js";

// EDHREC rank 4292.
//
// X is the damage dealt to your opponents this turn by every source (the
// ruling) — the `damage-taken` turn stat summed over them, not life lost.

export default defineCard({
  name: "Notorious Throng",
  manaCost: "{3}{U}",
  colors: ["U"],
  types: ["kindred", "sorcery"],
  subtypes: ["Rogue"],
  text: "Prowl {5}{U} (You may cast this for its prowl cost if you dealt combat damage to a player this turn with a Rogue.)\nCreate X 1/1 black Faerie Rogue creature tokens with flying, where X is the damage dealt to your opponents this turn. If this spell's prowl cost was paid, take an extra turn after this one.",
  alternativeCost: prowl("{5}{U}"),
  targets: [],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "create-token", token: "Faerie Rogue Token", count: { turnStat: "damage-taken", who: "each-opponent" } },
      { kind: "conditional", condition: { kind: "self-prowl-paid" }, then: { kind: "take-extra-turn" } },
    ],
  },
});
