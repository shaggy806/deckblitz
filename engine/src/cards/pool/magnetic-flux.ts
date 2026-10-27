import { defineCard } from "../define.js";

export default defineCard({
  name: "Magnetic Flux",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["instant"],
  text: "Artifact creatures you control gain flying until end of turn.",
  targets: [],
  effect: {
    kind: "grant-keyword-all",
    filter: { types: ["artifact", "creature"], controlledBy: "you" },
    keyword: "flying",
    duration: "end-of-turn",
  },
});
