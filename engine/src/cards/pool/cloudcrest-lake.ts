import { defineCard } from "../define.js";

// Champions of Kamigawa. Cinder Marsh's shape.

export default defineCard({
  name: "Cloudcrest Lake",
  colors: [],
  types: ["land"],
  text: "{T}: Add {C}.\n{T}: Add {W} or {U}. This land doesn't untap during your next untap step.",
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
        mana: { oneOf: ["W", "U"] },
        amount: 1,
        also: { kind: "tap", target: "source", doesntUntapNext: true, onlyDoesntUntap: true },
      },
      resolve: null,
      text: "{T}: Add {W} or {U}. This land doesn't untap during your next untap step.",
    },
  ],
});
