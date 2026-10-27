import { defineCard } from "../define.js";

// Legions (LGN). EDHREC rank 28169.

const PING = "{T}: This creature deals 1 damage to any target.";
const BLAST = "{X}{R}, {T}, Sacrifice this creature: It deals X damage to any target.";

export default defineCard({
  name: "Goblin Dynamo",
  manaCost: "{5}{R}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Goblin", "Mutant"],
  power: 4,
  toughness: 4,
  text: `${PING}\n${BLAST}`,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: ["any-target"],
      effect: { kind: "damage", amount: 1, target: 0 },
      resolve: null,
      text: PING,
    },
    {
      cost: { mana: "{X}{R}", tap: true, sacrifice: "self" },
      targets: ["any-target"],
      effect: { kind: "damage", amount: "x", target: 0 },
      resolve: null,
      text: BLAST,
    },
  ],
});
