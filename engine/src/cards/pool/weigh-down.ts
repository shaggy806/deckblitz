import { defineCard } from "../define.js";

// EDHREC rank 28037.

export default defineCard({
  name: "Weigh Down",
  manaCost: "{B}",
  colors: ["B"],
  types: ["sorcery"],
  additionalCost: { exileFromGraveyard: { count: 1, filter: { type: "creature" } } },
  text: "As an additional cost to cast this spell, exile a creature card from your graveyard.\nTarget creature gets -3/-3 until end of turn.",
  targets: ["creature"],
  effect: { kind: "modify-pt", target: 0, power: -3, toughness: -3, duration: "end-of-turn" },
});
