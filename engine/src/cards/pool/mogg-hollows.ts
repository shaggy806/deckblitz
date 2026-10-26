import { defineCard } from "../define.js";

// EDHREC rank 26077. Tempest's "doesn't untap" dual (Cinder Marsh's shape).

export default defineCard({
  name: "Mogg Hollows",
  colors: [],
  types: ["land"],
  text: "{T}: Add {C}.\n{T}: Add {R} or {G}. This land doesn't untap during your next untap step.",
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "add-mana", mana: "C", amount: 1 },
      resolve: null,
      text: "{T}: Add {C}.",
    },
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: {
        kind: "add-mana",
        mana: { oneOf: ["R", "G"] },
        amount: 1,
        also: { kind: "tap", target: "source", doesntUntapNext: true, onlyDoesntUntap: true },
      },
      resolve: null,
      text: "{T}: Add {R} or {G}. This land doesn't untap during your next untap step.",
    },
  ],
});
