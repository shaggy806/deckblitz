import { defineCard } from "../define.js";

export default defineCard({
  name: "Magewright's Stone",
  manaCost: "{2}",
  colors: [],
  types: ["artifact"],
  text: "{1}, {T}: Untap target creature that has an activated ability with {T} in its cost.",
  activated: [
    {
      cost: { mana: "{1}", tap: true },
      targets: [{ kind: "permanent", filter: { type: "creature", hasActivatedAbility: { tapCost: true } } }],
      effect: { kind: "untap", target: 0 },
      resolve: null,
      text: "{1}, {T}: Untap target creature that has an activated ability with {T} in its cost.",
    },
  ],
});
