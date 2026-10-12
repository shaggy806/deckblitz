import { defineCard } from "../define.js";

export default defineCard({
  name: "Thrun, the Last Troll",
  manaCost: "{2}{G}{G}",
  colors: ["G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Troll", "Shaman"],
  power: 4,
  toughness: 4,
  keywords: ["hexproof"],
  cantBeCountered: true,
  text: "This spell can't be countered.\nHexproof (This creature can't be the target of spells or abilities your opponents control.)\n{1}{G}: Regenerate Thrun.",
  activated: [
    {
      cost: { mana: "{1}{G}", tap: false },
      targets: [],
      effect: { kind: "regenerate", target: "source" },
      resolve: null,
      text: "{1}{G}: Regenerate Thrun.",
    },
  ],
});
