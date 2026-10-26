import { defineCard } from "../define.js";

export default defineCard({
  name: "Monstrify",
  manaCost: "{3}{G}",
  colors: ["G"],
  types: ["sorcery"],
  retrace: true,
  text: "Target creature gets +4/+4 until end of turn.\nRetrace (You may cast this card from your graveyard by discarding a land card in addition to paying its other costs.)",
  targets: ["creature"],
  effect: { kind: "modify-pt", target: 0, power: 4, toughness: 4, duration: "end-of-turn" },
});
