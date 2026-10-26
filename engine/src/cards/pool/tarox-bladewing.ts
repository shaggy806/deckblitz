import { defineCard } from "../define.js";

// EDHREC rank 30533. Future Sight.
//
// Grandeur as Skoa, Embermage writes it. X is Tarox's power as the ability
// resolves, locked in then (the ruling) — Chameleon Colossus's shape.

const GRANDEUR_TEXT =
  "Grandeur — Discard another card named Tarox Bladewing: Tarox Bladewing gets +X/+X until end of turn, where X is its power.";

export default defineCard({
  name: "Tarox Bladewing",
  manaCost: "{2}{R}{R}{R}",
  colors: ["R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Dragon"],
  power: 4,
  toughness: 3,
  keywords: ["flying", "haste"],
  text: `Flying, haste\n${GRANDEUR_TEXT}`,
  activated: [
    {
      cost: { mana: null, tap: false, discard: { count: 1, filter: { name: "Tarox Bladewing" } } },
      targets: [],
      effect: {
        kind: "modify-pt",
        target: "source",
        power: { powerOf: "source" },
        toughness: { powerOf: "source" },
        duration: "end-of-turn",
      },
      resolve: null,
      text: GRANDEUR_TEXT,
    },
  ],
});
