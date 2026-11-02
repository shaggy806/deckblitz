import { defineCard } from "../define.js";

export default defineCard({
  name: "Full Flowering",
  manaCost: "{X}{X}{G}",
  colors: ["G"],
  types: ["sorcery"],
  text: "Populate X times. (To populate, create a token that's a copy of a creature token you control. Do this X times.)",
  targets: [],
  effect: { kind: "repeat", times: "x", effect: { kind: "populate" } },
});
