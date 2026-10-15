import { defineCard } from "../define.js";

// EDHREC rank 18400.
//
// Both modes target, so a cast-time `castModal`; the fight is Brigid's
// Command's.

const FIGHT_TEXT = "Target creature you control fights target creature an opponent controls.";
const DESTROY_TEXT = "Destroy target Vehicle.";

export default defineCard({
  name: "Plow Through",
  manaCost: "{G}",
  colors: ["G"],
  types: ["sorcery"],
  text: `Choose one —\n• ${FIGHT_TEXT} (Each deals damage equal to its power to the other.)\n• ${DESTROY_TEXT}`,
  castModal: {
    minModes: 1,
    maxModes: 1,
    modes: [
      {
        text: FIGHT_TEXT,
        targets: ["creature-you-control", "creature-an-opponent-controls"],
        effect: { kind: "fight", a: 0, b: 1 },
      },
      {
        text: DESTROY_TEXT,
        targets: [{ kind: "permanent", filter: { subtype: "Vehicle" } }],
        effect: { kind: "destroy", target: 0 },
      },
    ],
  },
});
