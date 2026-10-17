import { defineCard } from "../define.js";

// EDHREC rank 20664.

export default defineCard({
  name: "Troublemaker Ouphe",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Ouphe"],
  power: 2,
  toughness: 2,
  kicker: { cost: "", keyword: "bargain" },
  text: "Bargain (You may sacrifice an artifact, enchantment, or token as you cast this spell.)\nWhen this creature enters, if it was bargained, exile target artifact or enchantment an opponent controls.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [
        {
          kind: "permanent",
          whose: "opponent",
          filter: { typesAnyOf: ["artifact", "enchantment"] },
        },
      ],
      effect: { kind: "exile", target: 0 },
      resolve: null,
      text: "When this creature enters, if it was bargained, exile target artifact or enchantment an opponent controls.",
      condition: { kind: "self-kicked" },
    },
  ],
});
