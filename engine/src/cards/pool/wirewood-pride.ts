import { defineCard } from "../define.js";

// EDHREC rank 13935. Timberwatch Elf's pump as an instant: every Elf on the
// battlefield counts, whoever controls it.

export default defineCard({
  name: "Wirewood Pride",
  manaCost: "{G}",
  colors: ["G"],
  types: ["instant"],
  text: "Target creature gets +X/+X until end of turn, where X is the number of Elves on the battlefield.",
  targets: ["creature"],
  effect: {
    kind: "modify-pt",
    target: 0,
    power: { countOf: { subtype: "Elf" } },
    toughness: { countOf: { subtype: "Elf" } },
    duration: "end-of-turn",
  },
});
