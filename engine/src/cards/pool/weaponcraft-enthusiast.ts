import { defineCard } from "../define.js";

export default defineCard({
  name: "Weaponcraft Enthusiast",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Aetherborn", "Artificer"],
  power: 0,
  toughness: 1,
  text: "Fabricate 2 (When this creature enters, put two +1/+1 counters on it or create two 1/1 colorless Servo artifact creature tokens.)",
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
  ],
});
