import { defineCard } from "../define.js";

const PT_TEXT = "Soul of Eternity's power and toughness are each equal to your life total.";
const ENCORE_TEXT =
  "Encore {7}{W}{W} ({7}{W}{W}, Exile this card from your graveyard: For each opponent, create a token copy that attacks that opponent this turn if able. They gain haste. Sacrifice them at the beginning of the next end step. Activate only as a sorcery.)";

export default defineCard({
  name: "Soul of Eternity",
  manaCost: "{5}{W}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Avatar"],
  power: 0,
  toughness: 0,
  text: `${PT_TEXT}\n${ENCORE_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      setBasePtFromCount: { countOf: "your-life-total", plusPower: 0, plusToughness: 0 },
      text: PT_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: "{7}{W}{W}", tap: false },
      zone: "graveyard",
      sorcerySpeed: true,
      targets: [],
      effect: { kind: "encore" },
      resolve: null,
      text: ENCORE_TEXT,
    },
  ],
});
