import { defineCard } from "../define.js";

// EDHREC rank 10032.
const GRANTED_TEXT = "When this creature enters, goad target creature an opponent controls.";

export default defineCard({
  name: "Taunting Sliver",
  manaCost: "{3}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Sliver"],
  power: 3,
  toughness: 3,
  text: `Sliver creatures you control have "${GRANTED_TEXT}" (Until your next turn, that creature attacks each combat if able and attacks a player other than you if able.)`,
  static: [
    {
      affects: { scope: "creatures-you-control", subtype: "Sliver" },
      grantsTriggered: [
        {
          trigger: { on: "enters-battlefield", who: "self" },
          targets: ["creature-an-opponent-controls"],
          effect: { kind: "goad", target: 0 },
          resolve: null,
          text: GRANTED_TEXT,
        },
      ],
      text: `Sliver creatures you control have "${GRANTED_TEXT}"`,
    },
  ],
});
