import { defineCard } from "../define.js";

// EDHREC rank 24886.
const ETB_TEXT = "When this creature enters, put a +1/+1 counter on another target Soldier you control.";

export default defineCard({
  name: "Aeronaut Cavalry",
  manaCost: "{4}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Soldier"],
  power: 3,
  toughness: 4,
  keywords: ["flying"],
  text: `Flying\n${ETB_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [{ kind: "other", of: { kind: "permanent", whose: "you", filter: { subtype: "Soldier" } } }],
      effect: { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 },
      resolve: null,
      text: ETB_TEXT,
    },
  ],
});
