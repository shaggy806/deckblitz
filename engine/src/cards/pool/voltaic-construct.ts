import { defineCard } from "../define.js";

export default defineCard({
  name: "Voltaic Construct",
  manaCost: "{4}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Golem", "Construct"],
  power: 2,
  toughness: 2,
  text: "{2}: Untap target artifact creature.",
  activated: [
    {
      cost: { mana: "{2}", tap: false },
      targets: [{ kind: "permanent", filter: { types: ["artifact", "creature"] } }],
      effect: { kind: "untap", target: 0 },
      resolve: null,
      text: "{2}: Untap target artifact creature.",
    },
  ],
});
