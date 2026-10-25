import { defineCard } from "../define.js";

// Commander 2016. A targeted modal spell: the mode is chosen as it's cast.
// "You may choose new targets" is `change-targets`' `choose-new` (rule
// 115.7d): any number of them, each kept if no new legal one is chosen.
export default defineCard({
  name: "Insidious Will",
  manaCost: "{2}{U}{U}",
  colors: ["U"],
  types: ["instant"],
  text:
    "Choose one —\n" +
    "• Counter target spell.\n" +
    "• You may choose new targets for target spell.\n" +
    "• Copy target instant or sorcery spell. You may choose new targets for the copy.",
  castModal: {
    minModes: 1,
    maxModes: 1,
    modes: [
      {
        text: "Counter target spell.",
        targets: ["spell"],
        effect: { kind: "counter", target: 0 },
      },
      {
        text: "You may choose new targets for target spell.",
        targets: ["spell"],
        effect: { kind: "change-targets", target: 0, how: "choose-new" },
      },
      {
        text: "Copy target instant or sorcery spell. You may choose new targets for the copy.",
        targets: ["instant-or-sorcery-spell"],
        effect: { kind: "copy-spell", target: 0, newTargets: true },
      },
    ],
  },
});
