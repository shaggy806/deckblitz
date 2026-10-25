import { defineCard } from "../define.js";

export default defineCard({
  name: "Summoner's Bane",
  manaCost: "{2}{U}{U}",
  colors: ["U"],
  types: ["instant"],
  text: "Counter target creature spell. Create a 2/2 blue Illusion creature token.",
  targets: ["creature-spell"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "counter", target: 0 },
      { kind: "create-token", token: "Illusion Token 2/2", count: 1 },
    ],
  },
});
