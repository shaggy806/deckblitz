import { defineCard } from "../define.js";

// EDHREC rank 15693.

export default defineCard({
  name: "Denethor, Stone Seer",
  manaCost: "{1}{U}",
  colors: ["U"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Noble"],
  power: 1,
  toughness: 3,
  text: "When Denethor enters, scry 2.\n{3}{R}, {T}, Sacrifice Denethor: Target player becomes the monarch. Denethor deals 3 damage to any target.",
  activated: [
    {
      cost: { mana: "{3}{R}", tap: true, sacrifice: "self" },
      targets: ["player", "any-target"],
      effect: {
        kind: "sequence",
        effects: [{ kind: "become-monarch", who: 0 }, { kind: "damage", amount: 3, target: 1 }],
      },
      resolve: null,
      text: "{3}{R}, {T}, Sacrifice Denethor: Target player becomes the monarch. Denethor deals 3 damage to any target.",
    },
  ],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "scry", amount: 2 },
      resolve: null,
      text: "When Denethor enters, scry 2.",
    },
  ],
});
