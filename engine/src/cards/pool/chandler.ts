import { defineCard } from "../define.js";

export default defineCard({
  name: "Chandler",
  manaCost: "{4}{R}",
  colors: ["R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Rogue"],
  power: 3,
  toughness: 3,
  text: "{R}{R}{R}, {T}: Destroy target artifact creature.",
  activated: [
    {
      cost: { mana: "{R}{R}{R}", tap: true },
      targets: [{ kind: "permanent", filter: { types: ["artifact", "creature"] } }],
      effect: { kind: "destroy", target: 0 },
      resolve: null,
      text: "{R}{R}{R}, {T}: Destroy target artifact creature.",
    },
  ],
});
