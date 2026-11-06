import { defineCard } from "../define.js";

export default defineCard({
  name: "Genesis Effect",
  manaCost: "{4}{R}",
  colors: ["R"],
  types: ["instant"],
  text: "Genesis Effect deals 6 damage to target creature. Destroy target land you control. Create a tapped Planet land token named New Planet with \"{T}: Add one mana of any color.\"",
  targets: ["creature", "land-you-control"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "damage", amount: 6, target: 0 },
      { kind: "destroy", target: 1 },
      { kind: "create-token", token: "New Planet Token", count: 1, tapped: true },
    ],
  },
});
