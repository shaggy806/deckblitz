import { defineCard } from "../define.js";

// Odyssey (ODY). EDHREC rank 18284.

const TEXT = "This creature enters with X +1/+1 counters on it.";

export default defineCard({
  name: "Ivy Elemental",
  manaCost: "{X}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Elemental"],
  power: 0,
  toughness: 0,
  text: TEXT,
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", counters: { kind: "+1/+1", amount: "x" } },
      text: TEXT,
    },
  ],
});
