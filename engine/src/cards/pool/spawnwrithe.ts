import { defineCard } from "../define.js";

// EDHREC rank 13072. The token copies Spawnwrithe's copiable values as they
// are when the trigger resolves (Conclave Evangelist's shape).

export default defineCard({
  name: "Spawnwrithe",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Elemental"],
  power: 2,
  toughness: 2,
  keywords: ["trample"],
  text: "Trample\nWhenever this creature deals combat damage to a player, create a token that's a copy of this creature.",
  triggered: [
    {
      trigger: { on: "deals-combat-damage-to-player", who: "self" },
      targets: [],
      effect: { kind: "create-token-copy", of: "source", count: 1 },
      resolve: null,
      text: "Whenever this creature deals combat damage to a player, create a token that's a copy of this creature.",
    },
  ],
});
