import { defineCard } from "../define.js";

// Ice Age (ICE). EDHREC rank 30625.

const TEXT = "{W}{W}: Return target nonsnow land you control to its owner's hand.";

export default defineCard({
  name: "Hallowed Ground",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["enchantment"],
  text: TEXT,
  activated: [
    {
      cost: { mana: "{W}{W}", tap: false },
      targets: [{ kind: "permanent", filter: { type: "land", controlledBy: "you", notSupertype: "snow" } }],
      effect: { kind: "return-to-hand", target: 0 },
      resolve: null,
      text: TEXT,
    },
  ],
});
