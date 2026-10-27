import { defineCard } from "../define.js";

const TEXT = "Whenever a Goblin deals combat damage to a player, that player discards a card.";

// Any Goblin, whoever controls it.
export default defineCard({
  name: "Cabal Slaver",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Human", "Cleric"],
  power: 2,
  toughness: 1,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "deals-combat-damage-to-player", who: "any", filter: { type: "creature", subtype: "Goblin" } },
      targets: [],
      effect: { kind: "discard", target: "trigger-player", amount: 1 },
      resolve: null,
      text: TEXT,
    },
  ],
});
