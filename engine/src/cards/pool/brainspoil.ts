import { defineCard } from "../define.js";
import { transmute } from "../helpers.js";

// Ravnica: City of Guilds (RAV). EDHREC rank 14513.
//
// "Target creature that isn't enchanted" is a permanent target with
// `enchanted: false`; transmute is Dimir House Guard's helper, at mana value 5.

const DESTROY_TEXT = "Destroy target creature that isn't enchanted. It can't be regenerated.";
const TRANSMUTE_TEXT =
  "Transmute {1}{B}{B} ({1}{B}{B}, Discard this card: Search your library for a card with the same mana value as this card, reveal it, put it into your hand, then shuffle. Transmute only as a sorcery.)";

export default defineCard({
  name: "Brainspoil",
  manaCost: "{3}{B}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: `${DESTROY_TEXT}\n${TRANSMUTE_TEXT}`,
  targets: [{ kind: "permanent", filter: { type: "creature", enchanted: false } }],
  effect: { kind: "destroy", target: 0, cantBeRegenerated: true },
  activated: [transmute("{1}{B}{B}", 5, TRANSMUTE_TEXT)],
});
