import { defineCard } from "../define.js";

// EDHREC rank 29712.
const ENTER_TEXT = "This creature enters with X +1/+0 counters on it.";
const PREVENT_TEXT = "Remove a +1/+0 counter from this creature: Prevent the next 1 damage that would be dealt to it this turn.";
const GROW_TEXT = "{R}{R}{R}: Put a +1/+0 counter on this creature. Activate only during your upkeep.";

export default defineCard({
  name: "Balduvian Hydra",
  manaCost: "{X}{R}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Hydra"],
  power: 0,
  toughness: 1,
  text: `${ENTER_TEXT}\n${PREVENT_TEXT}\n${GROW_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", counters: { kind: "+1/+0", amount: "x" } },
      text: ENTER_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: null, tap: false, removeCounter: { kind: "+1/+0", count: 1 } },
      targets: [],
      effect: { kind: "prevent-damage", target: "source", amount: 1 },
      resolve: null,
      text: PREVENT_TEXT,
    },
    {
      cost: { mana: "{R}{R}{R}", tap: false },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "+1/+0", amount: 1 },
      resolve: null,
      condition: { kind: "all", of: [{ kind: "your-turn" }, { kind: "turn-structure", steps: ["upkeep"] }] },
      text: GROW_TEXT,
    },
  ],
});
