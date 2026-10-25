import { defineCard } from "../define.js";

// EDHREC rank 14028. Khans of Tarkir.

const ACTIVATE_TEXT = "{1}, {T}, Remove a gem counter from this artifact: Target creature can't attack or block this turn.";

export default defineCard({
  name: "Briber's Purse",
  manaCost: "{X}",
  colors: [],
  types: ["artifact"],
  text: `This artifact enters with X gem counters on it.\n${ACTIVATE_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", counters: { kind: "gem", amount: "x" } },
      text: "This artifact enters with X gem counters on it.",
    },
  ],
  activated: [
    {
      cost: { mana: "{1}", tap: true, removeCounter: { kind: "gem", count: 1 } },
      targets: ["creature"],
      effect: { kind: "restrict", target: 0, restrictions: ["cant-attack", "cant-block"] },
      resolve: null,
      text: ACTIVATE_TEXT,
    },
  ],
});
