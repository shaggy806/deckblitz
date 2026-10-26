import { defineCard } from "../define.js";

// EDHREC rank 13912.

const ENTER_TEXT = "This creature enters with X +1/+1 counters on it.";

export default defineCard({
  name: "Nimbus Swimmer",
  manaCost: "{X}{G}{U}",
  colors: ["U", "G"],
  types: ["creature"],
  subtypes: ["Leviathan"],
  power: 0,
  toughness: 0,
  keywords: ["flying"],
  text: `Flying\n${ENTER_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", counters: { kind: "+1/+1", amount: "x" } },
      text: ENTER_TEXT,
    },
  ],
});
