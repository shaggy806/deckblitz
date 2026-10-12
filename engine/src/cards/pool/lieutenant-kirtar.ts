import { defineCard } from "../define.js";

export default defineCard({
  name: "Lieutenant Kirtar",
  manaCost: "{1}{W}{W}",
  colors: ["W"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Bird", "Soldier"],
  power: 2,
  toughness: 2,
  keywords: ["flying"],
  text: "Flying\n{1}{W}, Sacrifice Lieutenant Kirtar: Exile target attacking creature.",
  activated: [
    {
      cost: { mana: "{1}{W}", tap: false, sacrifice: "self" },
      targets: [{ kind: "permanent", filter: { attacking: true, type: "creature" } }],
      effect: { kind: "exile", target: 0 },
      resolve: null,
      text: "{1}{W}, Sacrifice Lieutenant Kirtar: Exile target attacking creature.",
    },
  ],
});
