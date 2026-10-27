import { defineCard } from "../define.js";

// Onslaught. EDHREC rank 25031. Spark Mage's trigger at 2 damage, with morph.

const TEXT =
  "Whenever this creature deals combat damage to a player, you may have it deal 2 damage to target creature that player controls.";

export default defineCard({
  name: "Skirk Commando",
  manaCost: "{1}{R}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Goblin"],
  power: 2,
  toughness: 1,
  morph: { keyword: "morph", cost: "{2}{R}" },
  text: `${TEXT}\nMorph {2}{R} (You may cast this card face down as a 2/2 creature for {3}. Turn it face up any time for its morph cost.)`,
  triggered: [
    {
      trigger: { on: "deals-combat-damage-to-player", who: "self" },
      targets: [{ kind: "permanent", whose: "trigger-player", filter: { type: "creature" } }],
      effect: {
        kind: "may",
        prompt: "Have this creature deal 2 damage to the targeted creature?",
        effect: { kind: "damage", amount: 2, target: 0 },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
