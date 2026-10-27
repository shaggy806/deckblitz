import { defineCard } from "../define.js";

// EDHREC rank 9805.

export default defineCard({
  name: "Goblin Burrows",
  colors: [],
  types: ["land"],
  text: "{T}: Add {C}.\n{1}{R}, {T}: Target Goblin creature gets +2/+0 until end of turn.",
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "add-mana", mana: "C", amount: 1 },
      resolve: null,
      text: "{T}: Add {C}.",
    },
    {
      cost: { mana: "{1}{R}", tap: true },
      targets: [{ kind: "permanent", filter: { type: "creature", subtype: "Goblin" } }],
      effect: { kind: "modify-pt", target: 0, power: 2, toughness: 0, duration: "end-of-turn" },
      resolve: null,
      text: "{1}{R}, {T}: Target Goblin creature gets +2/+0 until end of turn.",
    },
  ],
});
