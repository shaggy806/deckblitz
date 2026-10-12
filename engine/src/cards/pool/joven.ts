import { defineCard } from "../define.js";

export default defineCard({
  name: "Joven",
  manaCost: "{3}{R}{R}",
  colors: ["R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Rogue"],
  power: 3,
  toughness: 3,
  text: "{R}{R}{R}, {T}: Destroy target noncreature artifact.",
  activated: [
    {
      cost: { mana: "{R}{R}{R}", tap: true },
      targets: [{ kind: "permanent", filter: { type: "artifact", notTypes: ["creature"] } }],
      effect: { kind: "destroy", target: 0 },
      resolve: null,
      text: "{R}{R}{R}, {T}: Destroy target noncreature artifact.",
    },
  ],
});
