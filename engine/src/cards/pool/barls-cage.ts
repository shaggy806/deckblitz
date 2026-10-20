import { defineCard } from "../define.js";

const TEXT = "{3}: Target creature doesn't untap during its controller's next untap step.";

export default defineCard({
  name: "Barl's Cage",
  manaCost: "{4}",
  colors: [],
  types: ["artifact"],
  text: TEXT,
  activated: [
    {
      cost: { mana: "{3}", tap: false },
      targets: ["creature"],
      effect: { kind: "tap", target: 0, doesntUntapNext: true, onlyDoesntUntap: true },
      resolve: null,
      text: TEXT,
    },
  ],
});
