import { defineCard } from "../define.js";

export default defineCard({
  name: "Storied Veteran",
  manaCost: "{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Klingon", "Advisor"],
  power: 2,
  toughness: 1,
  text: "This creature can't block.\nYou may cast this card from your graveyard. If you do, it enters with a finality counter on it.",
  castSelfFromGraveyard: {},
  static: [
    {
      affects: { scope: "self" },
      restrictions: ["cant-block"],
      text: "This creature can't block.",
    },
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", counters: { kind: "finality", amount: 1 } },
      // "If you do": cast by this permission, not by another card's from a graveyard.
      condition: { kind: "source", filter: { castVia: "graveyard-permission" } },
      text: "You may cast this card from your graveyard. If you do, it enters with a finality counter on it.",
    },
  ],
});
