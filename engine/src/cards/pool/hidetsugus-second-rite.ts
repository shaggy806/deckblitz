import { defineCard } from "../define.js";

// Saviors of Kamigawa. The life total is read as it resolves (rule 608.2c):
// at anything but exactly 10, nothing happens.

const TEXT = "If target player has exactly 10 life, Hidetsugu's Second Rite deals 10 damage to that player.";

export default defineCard({
  name: "Hidetsugu's Second Rite",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["instant"],
  text: TEXT,
  targets: ["player"],
  effect: {
    kind: "conditional",
    condition: {
      kind: "of-player",
      player: { target: 0 },
      condition: { kind: "life-total", atLeast: 10, atMost: 10 },
    },
    then: { kind: "damage", amount: 10, target: 0 },
  },
});
