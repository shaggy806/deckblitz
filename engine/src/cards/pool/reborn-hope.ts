import { defineCard } from "../define.js";

export default defineCard({
  name: "Reborn Hope",
  manaCost: "{G}{W}",
  colors: ["W", "G"],
  types: ["sorcery"],
  text: "Return target multicolored card from your graveyard to your hand.",
  targets: [{ kind: "card-in-graveyard", whose: "you", filter: { multicolored: true } }],
  effect: { kind: "return-to-hand", target: 0, from: "graveyard" },
});
