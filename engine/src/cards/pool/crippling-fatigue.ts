import { defineCard } from "../define.js";

export default defineCard({
  name: "Crippling Fatigue",
  manaCost: "{1}{B}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "Target creature gets -2/-2 until end of turn.\nFlashback—{1}{B}, Pay 3 life. (You may cast this card from your graveyard for its flashback cost. Then exile it.)",
  targets: ["creature"],
  effect: { kind: "modify-pt", target: 0, power: -2, toughness: -2, duration: "end-of-turn" },
  flashback: { cost: "{1}{B}", payLife: 3 },
});
