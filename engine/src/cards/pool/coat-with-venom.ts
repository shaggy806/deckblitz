import { defineCard } from "../define.js";

export default defineCard({
  name: "Coat with Venom",
  manaCost: "{B}",
  colors: ["B"],
  types: ["instant"],
  text: "Target creature gets +1/+2 and gains deathtouch until end of turn. (Any amount of damage it deals to a creature is enough to destroy it.)",
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "modify-pt", target: 0, power: 1, toughness: 2, duration: "end-of-turn" },
      { kind: "grant-keyword", target: 0, keyword: "deathtouch", duration: "end-of-turn" },
    ],
  },
});
