import { defineCard } from "../define.js";

export default defineCard({
  name: "Fractal Summoning",
  manaCost: "{X}{G/U}{G/U}",
  colors: ["U", "G"],
  types: ["sorcery"],
  subtypes: ["Lesson"],
  text: "Create a 0/0 green and blue Fractal creature token. Put X +1/+1 counters on it.",
  effect: {
    kind: "create-token",
    token: "Fractal Token",
    count: 1,
    thenCounters: { kind: "+1/+1", amount: "x" },
  },
});
