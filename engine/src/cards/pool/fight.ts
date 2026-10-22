import { defineCard } from "../define.js";

const FACES = ["Prepare // Fight", "Prepare", "Fight"];

export default defineCard({
  name: "Fight",
  manaCost: "{3}{G}",
  colors: ["G"],
  types: ["sorcery"],
  text: "Aftermath (Cast this spell only from your graveyard. Then exile it.)\nTarget creature you control fights target creature an opponent controls.",
  targets: ["creature-you-control", "creature-an-opponent-controls"],
  effect: { kind: "fight", a: 0, b: 1 },
  faces: FACES,
  split: true,
  aftermath: true,
});
