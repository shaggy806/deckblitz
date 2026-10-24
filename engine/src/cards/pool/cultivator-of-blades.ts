import { defineCard } from "../define.js";

// Kaladesh (KLD). EDHREC rank 10000.
//
// Fabricate 2 as Angel of Invention's. The attack trigger's choice is made as
// it resolves (ruling); X is this creature's power then — as it last existed
// if it has left, 0 if negative — and the set of other attacking creatures is
// fixed then too.
const FABRICATE =
  "Fabricate 2 (When this creature enters, put two +1/+1 counters on it or create two 1/1 colorless Servo artifact creature tokens.)";
const ATTACK =
  "Whenever this creature attacks, you may have other attacking creatures get +X/+X until end of turn, where X is this creature's power.";

export default defineCard({
  name: "Cultivator of Blades",
  manaCost: "{3}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Elf", "Artificer"],
  power: 1,
  toughness: 1,
  text: `${FABRICATE}\n${ATTACK}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "conditional",
        condition: { kind: "source-on-battlefield" },
        then: {
          kind: "modal",
          minModes: 1,
          maxModes: 1,
          modes: [
            {
              text: "Put two +1/+1 counters on this creature.",
              effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 2 },
            },
            {
              text: "Create two 1/1 colorless Servo artifact creature tokens.",
              effect: { kind: "create-token", token: "Servo Token", count: 2 },
            },
          ],
        },
        else: { kind: "create-token", token: "Servo Token", count: 2 },
      },
      resolve: null,
      text: FABRICATE,
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
