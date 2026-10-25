import { defineCard } from "../define.js";

export default defineCard({
  name: "Will of the Naga",
  manaCost: "{4}{U}{U}",
  colors: ["U"],
  types: ["instant"],
  text: "Delve (Each card you exile from your graveyard while casting this spell pays for {1}.)\nTap up to two target creatures. Those creatures don't untap during their controller's next untap step.",
  delve: true,
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
