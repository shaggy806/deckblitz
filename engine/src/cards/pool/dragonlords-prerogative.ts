import { defineCard } from "../define.js";

// "If you revealed a Dragon card or controlled a Dragon" is the spell being
// kicked (`orControls`): a copy has it only if a card was revealed (the ruling).

export default defineCard({
  name: "Dragonlord's Prerogative",
  manaCost: "{4}{U}{U}",
  colors: ["U"],
  types: ["instant"],
  kicker: {
    cost: "",
    keyword: "reveal",
    behold: { filter: { subtype: "Dragon" }, text: "a Dragon card", fromHand: true },
    orControls: { subtype: "Dragon" },
  },
  cantBeCountered: { kind: "self-kicked" },
  text: "As an additional cost to cast this spell, you may reveal a Dragon card from your hand.\nIf you revealed a Dragon card or controlled a Dragon as you cast this spell, this spell can't be countered.\nDraw four cards.",
  targets: [],
  effect: { kind: "draw", amount: 4 },
});
