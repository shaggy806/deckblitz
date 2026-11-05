import { defineCard } from "../define.js";

// EDHREC rank 17634.

export default defineCard({
  name: "Angel of Salvation",
  manaCost: "{6}{W}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Angel"],
  power: 5,
  toughness: 5,
  keywords: ["flash", "flying"],
  convoke: true,
  text: "Flash; convoke (Your creatures can help cast this spell. Each creature you tap while casting this spell pays for {1} or one mana of that creature's color.)\nFlying\nWhen this creature enters, prevent the next 5 damage that would be dealt this turn to any number of targets, divided as you choose.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [{ kind: "any-number", of: "any-target", max: 5 }],
      effect: { kind: "prevent-damage-divided", from: 0 },
      resolve: null,
      text: "When this creature enters, prevent the next 5 damage that would be dealt this turn to any number of targets, divided as you choose.",
      divided: { total: 5, slot: 0, of: "damage to prevent" },
    },
  ],
});
