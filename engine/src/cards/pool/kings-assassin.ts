import { defineCard } from "../define.js";
import { BEFORE_ATTACKERS_DECLARED } from "../helpers.js";

// EDHREC rank 21582.

const TEXT = "{T}: Destroy target tapped creature. Activate only during your turn, before attackers are declared.";

export default defineCard({
  name: "King's Assassin",
  manaCost: "{1}{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Human", "Assassin"],
  power: 1,
  toughness: 1,
  text: TEXT,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [{ kind: "permanent", filter: { tapped: true, type: "creature" } }],
      effect: { kind: "destroy", target: 0 },
      condition: BEFORE_ATTACKERS_DECLARED,
      resolve: null,
      text: TEXT,
    },
  ],
});
