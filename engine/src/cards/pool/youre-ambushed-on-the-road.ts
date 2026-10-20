import { defineCard } from "../define.js";

const RETREAT_TEXT = "Make a Retreat — Return target creature you control to its owner's hand.";
const FIGHT_TEXT = "Stand and Fight — Target creature gets +1/+3 until end of turn.";

export default defineCard({
  name: "You're Ambushed on the Road",
  manaCost: "{W}",
  colors: ["W"],
  types: ["instant"],
  text: `Choose one —\n• ${RETREAT_TEXT}\n• ${FIGHT_TEXT}`,
  castModal: {
    minModes: 1,
    maxModes: 1,
    modes: [
      {
        text: RETREAT_TEXT,
        targets: ["creature-you-control"],
        effect: { kind: "return-to-hand", target: 0 },
      },
      {
        text: FIGHT_TEXT,
        targets: ["creature"],
        effect: { kind: "modify-pt", target: 0, power: 1, toughness: 3, duration: "end-of-turn" },
      },
    ],
  },
});
