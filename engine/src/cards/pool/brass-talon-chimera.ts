import { defineCard } from "../define.js";

// Visions (VIS). EDHREC rank 30736. The first strike is granted for as long as
// the creature stays on the battlefield ("this effect lasts indefinitely").

const TEXT =
  "Sacrifice this creature: Put a +2/+2 counter on target Chimera creature. It gains first strike. (This effect lasts indefinitely.)";

export default defineCard({
  name: "Brass-Talon Chimera",
  manaCost: "{4}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Chimera"],
  power: 2,
  toughness: 2,
  keywords: ["first-strike"],
  text: `First strike\n${TEXT}`,
  activated: [
    {
      cost: { mana: null, tap: false, sacrifice: "self" },
      targets: [{ kind: "permanent", filter: { type: "creature", subtype: "Chimera" } }],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "add-counter", target: 0, counter: "+2/+2", amount: 1 },
          { kind: "grant-keyword", target: 0, keyword: "first-strike", duration: "permanent" },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
