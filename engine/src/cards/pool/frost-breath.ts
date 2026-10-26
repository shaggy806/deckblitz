import { defineCard } from "../define.js";

export default defineCard({
  name: "Frost Breath",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["instant"],
  text: "Tap up to two target creatures. Those creatures don't untap during their controller's next untap step.",
  targets: [
    { kind: "optional", of: "creature" },
    { kind: "optional", of: { kind: "other", of: "creature", than: { slot: 0 } } },
  ],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "tap", target: 0, doesntUntapNext: true },
      { kind: "tap", target: 1, doesntUntapNext: true },
    ],
  },
});
