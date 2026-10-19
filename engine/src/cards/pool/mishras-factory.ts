import { defineCard } from "../define.js";

export default defineCard({
  name: "Mishra's Factory",
  types: ["land"],
  text: "{T}: Add {C}.\n{1}: This land becomes a 2/2 Assembly-Worker artifact creature until end of turn. It's still a land.\n{T}: Target Assembly-Worker creature gets +1/+1 until end of turn.",
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "add-mana", mana: "C", amount: 1 },
      resolve: null,
      text: "{T}: Add {C}.",
    },
    {
      cost: { mana: "{1}", tap: false },
      targets: [],
      effect: {
        kind: "animate",
        target: "source",
        power: 2,
        toughness: 2,
        addTypes: ["artifact", "creature"],
        addSubtypes: ["Assembly-Worker"],
        duration: "end-of-turn",
      },
      resolve: null,
      text: "{1}: This land becomes a 2/2 Assembly-Worker artifact creature until end of turn. It's still a land.",
    },
    {
      // It may target itself once animated (the classic pump on a blocking Factory).
      cost: { mana: null, tap: true },
      targets: [{ kind: "permanent", filter: { type: "creature", subtype: "Assembly-Worker" } }],
      effect: { kind: "modify-pt", target: 0, power: 1, toughness: 1, duration: "end-of-turn" },
      resolve: null,
      text: "{T}: Target Assembly-Worker creature gets +1/+1 until end of turn.",
    },
  ],
});
