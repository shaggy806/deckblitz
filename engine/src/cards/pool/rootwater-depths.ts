import { defineCard } from "../define.js";

// EDHREC rank 24621.

export default defineCard({
  name: "Rootwater Depths",
  colors: [],
  types: ["land"],
  text: "{T}: Add {C}.\n{T}: Add {U} or {B}. This land doesn't untap during your next untap step.",
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
        mana: { oneOf: ["U", "B"] },
        amount: 1,
        // Part of the mana ability, so no stack: the cost has tapped the land
        // already, and this only holds it through the next untap step.
        also: { kind: "tap", target: "source", doesntUntapNext: true, onlyDoesntUntap: true },
      },
      resolve: null,
      text: "{T}: Add {U} or {B}. This land doesn't untap during your next untap step.",
    },
  ],
});
