import { defineCard } from "../define.js";

export default defineCard({
  name: "Strength of Arms",
  manaCost: "{W}",
  colors: ["W"],
  types: ["instant"],
  text: "Target creature gets +2/+2 until end of turn. If you control an Equipment, create a 1/1 white Human Soldier creature token.",
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "modify-pt", target: 0, power: 2, toughness: 2, duration: "end-of-turn" },
      {
        kind: "conditional",
        condition: { kind: "controls", filter: { subtype: "Equipment" }, atLeast: 1 },
        then: { kind: "create-token", token: "Human Soldier Token", count: 1 },
      },
    ],
  },
});
