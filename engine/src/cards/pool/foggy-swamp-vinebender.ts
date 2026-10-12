import { defineCard } from "../define.js";

// EDHREC rank 17311.

export default defineCard({
  name: "Foggy Swamp Vinebender",
  manaCost: "{3}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Human", "Plant", "Ally"],
  power: 4,
  toughness: 3,
  text: "This creature can't be blocked by creatures with power 2 or less.\nWaterbend {5}: Put a +1/+1 counter on this creature. Activate only during your turn. (While paying a waterbend cost, you can tap your artifacts and creatures to help. Each one pays for {1}.)",
  activated: [
    {
      cost: { mana: "{5}", tap: false, waterbend: true },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
      resolve: null,
      text: "Waterbend {5}: Put a +1/+1 counter on this creature. Activate only during your turn.",
      condition: { kind: "your-turn" },
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      cantBeBlockedBy: { power: { op: "lte", n: 2 } },
      text: "This creature can't be blocked by creatures with power 2 or less.",
    },
  ],
});
