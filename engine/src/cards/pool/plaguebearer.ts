import { defineCard } from "../define.js";

// EDHREC rank 24349. Gorilla Shaman's shape: the target's mana value is X.

export default defineCard({
  name: "Plaguebearer",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Zombie"],
  power: 1,
  toughness: 1,
  text: "{X}{X}{B}: Destroy target nonblack creature with mana value X.",
  activated: [
    {
      cost: { mana: "{X}{X}{B}", tap: false },
      targets: [{ kind: "permanent", filter: { type: "creature", notColors: ["B"], manaValue: { op: "eq", n: "x" } } }],
      effect: { kind: "destroy", target: 0 },
      resolve: null,
      text: "{X}{X}{B}: Destroy target nonblack creature with mana value X.",
    },
  ],
});
