import { defineCard } from "../define.js";

export default defineCard({
  name: "Totally Lost",
  manaCost: "{4}{U}",
  colors: ["U"],
  types: ["instant"],
  text: "Put target nonland permanent on top of its owner's library.",
  targets: ["nonland-permanent"],
  effect: { kind: "put-on-library", target: 0, position: "top" },
});
