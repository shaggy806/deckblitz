import { defineCard } from "../define.js";

const TEXT = "{3}, {T}, Sacrifice another Zombie: Create two tokens that are copies of the sacrificed creature.";

// EDHREC rank 4661. The sacrificed creature is copied as it last existed on the battlefield
// (rule 608.2h): a Clone's copied values, a token's own (rule 707.2).
export default defineCard({
  name: "Cleaver Skaab",
  manaCost: "{3}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Zombie", "Horror"],
  power: 2,
  toughness: 4,
  text: TEXT,
  activated: [
    {
      cost: { mana: "{3}", tap: true, sacrifice: { filter: { subtype: "Zombie", isSource: false } } },
      targets: [],
      effect: { kind: "create-token-copy", of: { paid: "sacrificed" }, count: 2, who: "you" },
      resolve: null,
      text: TEXT,
    },
  ],
});
