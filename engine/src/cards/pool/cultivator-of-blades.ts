import { defineCard } from "../define.js";

const ATTACK =
  "Whenever this creature attacks, you may have other attacking creatures get +X/+X until end of turn, where X is this creature's power.";

// X is read as the trigger resolves (last-known power if it's gone; a power
// below 0 counts as 0 — `powerOf`), and the "may" is decided then too (the rulings).
export default defineCard({
  name: "Cultivator of Blades",
  manaCost: "{3}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Elf", "Artificer"],
  power: 1,
  toughness: 1,
  text: `Fabricate 2 (When this creature enters, put two +1/+1 counters on it or create two 1/1 colorless Servo artifact creature tokens.)\n${ATTACK}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        // Fabricate (rule 702.123a): the choice only while it's still on the
        // battlefield; otherwise the counters can't go on it, so the Servos (ruling).
        kind: "conditional",
        condition: { kind: "source-on-battlefield" },
        then: {
          kind: "modal",
          minModes: 1,
          maxModes: 1,
          modes: [
            {
              text: "Put 2 +1/+1 counters on this creature.",
              effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 2 },
            },
            {
              text: "Create 2 1/1 colorless Servo artifact creature tokens.",
              effect: { kind: "create-token", token: "Servo Token", count: 2 },
            },
          ],
        },
        else: { kind: "create-token", token: "Servo Token", count: 2 },
      },
      resolve: null,
      text: "Fabricate 2",
    },
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Have other attacking creatures get +X/+X, where X is Cultivator of Blades's power?",
        effect: {
          kind: "modify-pt-all",
          filter: { type: "creature", attacking: true },
          power: { powerOf: "source" },
          toughness: { powerOf: "source" },
          duration: "end-of-turn",
          exceptSource: true,
        },
      },
      resolve: null,
      text: ATTACK,
    },
  ],
});
