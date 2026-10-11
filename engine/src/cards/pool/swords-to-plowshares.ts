import { defineCard } from "../define.js";

// Exile first, then the life — the printed order. `{ powerOf }` and "its
// controller" read the creature as it last existed on the battlefield (rule
// 608.2h), so a pumped creature gains its controller the pumped power.
export default defineCard({
  name: "Swords to Plowshares",
  // Pinned: Scryfall answers "Swords to Plowshares" by name with Emeritus of Truce // Swords to Plowshares, whose
  // prepare spell or adventure shares the name.
  art: "f7e12477-d59f-442b-a678-1be746d0b7be",
  manaCost: "{W}",
  colors: ["W"],
  types: ["instant"],
  text: "Exile target creature. Its controller gains life equal to its power.",
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "exile", target: 0 },
      {
        kind: "gain-life",
        amount: { powerOf: 0 },
        toControllerOfTarget: 0,
      },
    ],
  },
});
