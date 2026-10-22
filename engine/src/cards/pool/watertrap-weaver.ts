import { defineCard } from "../define.js";

// EDHREC rank 22440. Frost Trickster's enters trigger; an already-tapped
// creature can be targeted and still won't untap (the ruling).

const TEXT =
  "When this creature enters, tap target creature an opponent controls. That creature doesn't untap during its controller's next untap step.";

export default defineCard({
  name: "Watertrap Weaver",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Merfolk", "Wizard"],
  power: 2,
  toughness: 2,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["creature-an-opponent-controls"],
      effect: { kind: "tap", target: 0, doesntUntapNext: true },
      resolve: null,
      text: TEXT,
    },
  ],
});
