import { defineCard } from "../define.js";

export default defineCard({
  name: "Sadistic Slash",
  manaCost: "{3}{B}",
  colors: ["B"],
  types: ["instant"],
  mayhem: { cost: "{1}{B}" },
  text: "Target creature gets -5/-5 until end of turn.\nMayhem {1}{B} (You may cast this card from your graveyard for {1}{B} if you discarded it this turn.)",
  targets: ["creature"],
  effect: { kind: "modify-pt", target: 0, power: -5, toughness: -5, duration: "end-of-turn" },
});
