import { defineCard } from "../define.js";
import { exploit } from "../helpers.js";

// EDHREC rank 6107.

export default defineCard({
  name: "Fell Stinger",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Zombie", "Scorpion"],
  power: 3,
  toughness: 2,
  keywords: ["deathtouch"],
  text: "Deathtouch\nExploit (When this creature enters, you may sacrifice a creature.)\nWhen this creature exploits a creature, target player draws two cards and loses 2 life.",
  triggered: [
    exploit(),
    {
      trigger: { on: "exploits", who: "self" },
      targets: ["player"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "draw", amount: 2, target: 0 },
          { kind: "lose-life", amount: 2, target: 0 },
        ],
      },
      resolve: null,
      text: "When this creature exploits a creature, target player draws two cards and loses 2 life.",
    },
  ],
});
