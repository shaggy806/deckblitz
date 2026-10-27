import { defineCard } from "../define.js";

// Onslaught. EDHREC rank 28025.
//
// Impaler Shrike's shape: the discard is the `then` of the sacrifice, so it
// happens only if the Cadaver was sacrificed ("if you do").

const HIT =
  "Whenever this creature deals combat damage to a player, you may sacrifice it. If you do, that player discards three cards.";

export default defineCard({
  name: "Haunted Cadaver",
  manaCost: "{3}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Zombie"],
  power: 2,
  toughness: 2,
  morph: { keyword: "morph", cost: "{1}{B}" },
  text: `${HIT}\nMorph {1}{B} (You may cast this card face down as a 2/2 creature for {3}. Turn it face up any time for its morph cost.)`,
  triggered: [
    {
      trigger: { on: "deals-combat-damage-to-player", who: "self" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Sacrifice Haunted Cadaver to have that player discard three cards?",
        effect: { kind: "sacrifice-source", then: { kind: "discard", target: "trigger-player", amount: 3 } },
      },
      resolve: null,
      text: HIT,
    },
  ],
});
