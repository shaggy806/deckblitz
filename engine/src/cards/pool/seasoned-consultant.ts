import { defineCard } from "../define.js";

// Fires once per attack declaration of three or more creatures; what happens
// to them afterwards doesn't matter (the ruling).

const TEXT = "Whenever you attack with three or more creatures, this creature gets +2/+0 until end of turn.";

export default defineCard({
  name: "Seasoned Consultant",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Detective"],
  power: 1,
  toughness: 3,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "attack-with", who: "you", atLeast: 3 },
      targets: [],
      effect: { kind: "modify-pt", target: "source", power: 2, toughness: 0, duration: "end-of-turn" },
      resolve: null,
      text: TEXT,
    },
  ],
});
