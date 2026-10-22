import { defineCard } from "../define.js";

const FACES = ["Prepare // Fight", "Prepare", "Fight"];

export default defineCard({
  name: "Prepare",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["instant"],
  text: "Untap target creature. It gets +2/+2 and gains lifelink until end of turn.",
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "untap", target: 0 },
      { kind: "modify-pt", target: 0, power: 2, toughness: 2, duration: "end-of-turn" },
      { kind: "grant-keyword", target: 0, keyword: "lifelink", duration: "end-of-turn" },
    ],
  },
  faces: FACES,
  split: true,
});
