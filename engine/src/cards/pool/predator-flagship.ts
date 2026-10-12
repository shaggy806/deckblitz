import { defineCard } from "../define.js";

export default defineCard({
  name: "Predator, Flagship",
  manaCost: "{5}",
  colors: [],
  supertypes: ["legendary"],
  types: ["artifact"],
  text: "{2}: Target creature gains flying until end of turn.\n{5}, {T}: Destroy target creature with flying.",
  activated: [
    {
      cost: { mana: "{2}", tap: false },
      targets: ["creature"],
      effect: { kind: "grant-keyword", target: 0, keyword: "flying", duration: "end-of-turn" },
      resolve: null,
      text: "{2}: Target creature gains flying until end of turn.",
    },
    {
      cost: { mana: "{5}", tap: true },
      targets: [{ kind: "permanent", filter: { type: "creature", keyword: "flying" } }],
      effect: { kind: "destroy", target: 0 },
      resolve: null,
      text: "{5}, {T}: Destroy target creature with flying.",
    },
  ],
});
