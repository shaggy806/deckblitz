import { defineCard } from "../define.js";

export default defineCard({
  name: "Argivian Blacksmith",
  manaCost: "{1}{W}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Artificer"],
  power: 2,
  toughness: 2,
  text: "{T}: Prevent the next 2 damage that would be dealt to target artifact creature this turn.",
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [{ kind: "permanent", filter: { types: ["artifact", "creature"] } }],
      effect: { kind: "prevent-damage", target: 0, amount: 2 },
      resolve: null,
      text: "{T}: Prevent the next 2 damage that would be dealt to target artifact creature this turn.",
    },
  ],
});
