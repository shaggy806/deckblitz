import { defineCard } from "../define.js";

export default defineCard({
  name: "Luxurious Libation",
  manaCost: "{X}{G}",
  colors: ["G"],
  types: ["instant"],
  text: "Target creature gets +X/+X until end of turn. Create a 1/1 green and white Citizen creature token.",
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "modify-pt", target: 0, power: "x", toughness: "x", duration: "end-of-turn" },
      { kind: "create-token", token: "Citizen Token", count: 1 },
    ],
  },
});
