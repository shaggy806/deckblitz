import { defineCard } from "../define.js";

// EDHREC rank 26010. Fallen Empires.
// X is the sacrificed creature's mana value as it last existed (rule 608.2h).

const TEXT =
  "{1}{U}{U}, Sacrifice a blue creature: Create X 1/1 blue Camarid creature tokens, where X is the sacrificed creature's mana value.";

export default defineCard({
  name: "Homarid Spawning Bed",
  manaCost: "{U}{U}",
  colors: ["U"],
  types: ["enchantment"],
  text: TEXT,
  activated: [
    {
      cost: { mana: "{1}{U}{U}", tap: false, sacrifice: { filter: { type: "creature", colors: ["U"] } } },
      targets: [],
      effect: { kind: "create-token", token: "Camarid Token", count: { manaValueOf: "sacrificed" } },
      resolve: null,
      text: TEXT,
    },
  ],
});
