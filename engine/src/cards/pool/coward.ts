import { defineCard } from "../define.js";

const FACES = ["Coward // Killer", "Coward", "Killer"];
const COWARD_TEXT =
  "Target creature can't block this turn and becomes a Coward in addition to its other types until end of turn.\nTime travel.";

export default defineCard({
  name: "Coward",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: COWARD_TEXT,
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "restrict", target: 0, restrictions: ["cant-block"] },
      { kind: "add-types", target: 0, addSubtypes: ["Coward"], duration: "end-of-turn" },
      { kind: "time-travel" },
    ],
  },
  faces: FACES,
  split: true,
});
