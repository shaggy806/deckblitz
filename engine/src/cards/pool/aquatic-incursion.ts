import { defineCard } from "../define.js";

// EDHREC rank 18157. Rivals of Ixalan.
//
// "Target Merfolk" is any Merfolk permanent. "Can't be blocked this turn" is
// a combat restriction, not a granted ability; one already blocked stays
// blocked (the ruling).

export default defineCard({
  name: "Aquatic Incursion",
  manaCost: "{3}{U}",
  colors: ["U"],
  types: ["enchantment"],
  text: "When this enchantment enters, create two 1/1 blue Merfolk creature tokens with hexproof. (They can't be the targets of spells or abilities your opponents control.)\n{3}{U}: Target Merfolk can't be blocked this turn.",
  activated: [
    {
      cost: { mana: "{3}{U}", tap: false },
      targets: [{ kind: "permanent", filter: { subtype: "Merfolk" } }],
      effect: { kind: "restrict", target: 0, restrictions: ["cant-be-blocked"] },
      resolve: null,
      text: "{3}{U}: Target Merfolk can't be blocked this turn.",
    },
  ],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Merfolk Token (Deeproot Waters)", count: 2 },
      resolve: null,
      text: "When this enchantment enters, create two 1/1 blue Merfolk creature tokens with hexproof.",
    },
  ],
});
