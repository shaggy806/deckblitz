import { defineCard } from "../define.js";

export default defineCard({
  name: "Peema Outrider",
  manaCost: "{2}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Elf", "Artificer"],
  power: 3,
  toughness: 3,
  keywords: ["trample"],
  text: "Trample\nFabricate 1 (When this creature enters, put a +1/+1 counter on it or create a 1/1 colorless Servo artifact creature token.)",
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
              text: "Put 1 +1/+1 counter on this creature.",
              effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
            },
            {
              text: "Create 1 1/1 colorless Servo artifact creature token.",
              effect: { kind: "create-token", token: "Servo Token", count: 1 },
            },
          ],
        },
        else: { kind: "create-token", token: "Servo Token", count: 1 },
      },
      resolve: null,
      text: "Fabricate 1",
    },
  ],
});
