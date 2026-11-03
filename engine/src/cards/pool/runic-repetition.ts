import { defineCard } from "../define.js";

// Shadows over Innistrad. "Target exiled card with flashback you own":
// `card-in-exile` owned by its caster, the printed flashback read in exile
// (`hasFlashback`) — a card exiled face down has no abilities (rule 406.3a).
const TEXT = "Return target exiled card with flashback you own to your hand.";

export default defineCard({
  name: "Runic Repetition",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["sorcery"],
  text: TEXT,
  targets: [{ kind: "card-in-exile", whose: "you", filter: { hasFlashback: true } }],
  effect: { kind: "return-to-hand", target: 0, from: "exile" },
});
