import { defineCard } from "../define.js";

// "Any player may activate this ability": `anyPlayer` (rule 602.2).

const PUMP_TEXT = "{3}: Put a +1/+1 counter on this creature. Any player may activate this ability.";

export default defineCard({
  name: "Feral Hydra",
  manaCost: "{X}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Hydra", "Beast"],
  power: 0,
  toughness: 0,
  text: `This creature enters with X +1/+1 counters on it.\n${PUMP_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", counters: { kind: "+1/+1", amount: "x" } },
      text: "This creature enters with X +1/+1 counters on it.",
    },
  ],
  activated: [
    {
      cost: { mana: "{3}", tap: false },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
      resolve: null,
      anyPlayer: true,
      text: PUMP_TEXT,
    },
  ],
});
