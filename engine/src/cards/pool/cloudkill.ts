import { defineCard } from "../define.js";

const X = { greatestCommanderManaValue: true, onBattlefieldOrInCommandZone: true } as const;

export default defineCard({
  name: "Cloudkill",
  manaCost: "{4}{B}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "All creatures get -X/-X until end of turn, where X is the greatest mana value of a commander you own on the battlefield or in the command zone.",
  targets: [],
  effect: {
    kind: "modify-pt-all",
    filter: { type: "creature" },
    power: { product: [X, -1] },
    toughness: { product: [X, -1] },
    duration: "end-of-turn",
  },
});
