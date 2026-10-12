import { defineCard } from "../define.js";

export default defineCard({
  name: "Trolls of Tel-Jilad",
  manaCost: "{5}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Troll", "Shaman"],
  power: 5,
  toughness: 6,
  text: "{1}{G}: Regenerate target green creature.",
  activated: [
    {
      cost: { mana: "{1}{G}", tap: false },
      targets: [{ kind: "permanent", filter: { colors: ["G"], type: "creature" } }],
      effect: { kind: "regenerate", target: 0 },
      resolve: null,
      text: "{1}{G}: Regenerate target green creature.",
    },
  ],
});
