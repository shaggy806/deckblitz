import { defineCard } from "../define.js";

const FACES = ["Status // Statue", "Status", "Statue"];
const STATUS_TEXT = "Target creature gets +1/+1 and gains deathtouch until end of turn.";

// The left half of Status // Statue (see status-statue.ts).
export default defineCard({
  name: "Status",
  manaCost: "{B/G}",
  colors: ["B", "G"],
  types: ["instant"],
  text: STATUS_TEXT,
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "modify-pt", target: 0, power: 1, toughness: 1, duration: "end-of-turn" },
      { kind: "grant-keyword", target: 0, keyword: "deathtouch", duration: "end-of-turn" },
    ],
  },
  faces: FACES,
  split: true,
});
