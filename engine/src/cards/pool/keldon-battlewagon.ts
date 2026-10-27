import { defineCard } from "../define.js";

// Prophecy. EDHREC rank 28526. Any untapped creature you control may pay the
// cost, this one included (Bramblesnap); X is that creature's power
// (Impelled Giant).

const SAC_TEXT = "When this creature attacks, sacrifice it at end of combat.";
const PUMP_TEXT =
  "Tap an untapped creature you control: This creature gets +X/+0 until end of turn, where X is the power of the creature tapped this way.";

export default defineCard({
  name: "Keldon Battlewagon",
  manaCost: "{5}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Juggernaut"],
  power: 0,
  toughness: 3,
  keywords: ["trample"],
  text: `Trample\nThis creature can't block.\n${SAC_TEXT}\n${PUMP_TEXT}`,
  activated: [
    {
      cost: {
        mana: null,
        tap: false,
        tapOthers: { count: 1, filter: { type: "creature", controlledBy: "you" }, includeSelf: true },
      },
      targets: [],
      effect: {
        kind: "modify-pt",
        target: "source",
        power: { powerOf: "tapped" },
        toughness: 0,
        duration: "end-of-turn",
      },
      resolve: null,
      text: PUMP_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: {
        kind: "delayed-trigger",
        at: "end-of-combat",
        effect: { kind: "sacrifice-target", target: "source" },
        text: "Sacrifice Keldon Battlewagon.",
      },
      resolve: null,
      text: SAC_TEXT,
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      restrictions: ["cant-block"],
      text: "This creature can't block.",
    },
  ],
});
