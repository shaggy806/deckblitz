import { defineCard } from "../define.js";

// EDHREC rank 31025.
export default defineCard({
  name: "Chill Haunting",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["instant"],
  text: "As an additional cost to cast this spell, exile X creature cards from your graveyard.\nTarget creature gets -X/-X until end of turn.",
  additionalCost: { exileFromGraveyard: { count: "x", filter: { type: "creature" } } },
  targets: ["creature"],
  effect: {
    kind: "modify-pt",
    target: 0,
    power: { product: ["x", -1] },
    toughness: { product: ["x", -1] },
    duration: "end-of-turn",
  },
});
