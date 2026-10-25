import { defineCard } from "../define.js";

export default defineCard({
  name: "Revel of the Fallen God",
  manaCost: "{3}{R}{R}{G}{G}",
  colors: ["R", "G"],
  types: ["sorcery"],
  text: "Create four 2/2 red and green Satyr creature tokens with haste.",
  effect: { kind: "create-token", token: "2/2 Red Green Satyr Token (Haste)", count: 4 },
});
