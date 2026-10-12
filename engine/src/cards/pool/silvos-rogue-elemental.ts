import { defineCard } from "../define.js";

export default defineCard({
  name: "Silvos, Rogue Elemental",
  manaCost: "{3}{G}{G}{G}",
  colors: ["G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Elemental"],
  power: 8,
  toughness: 5,
  keywords: ["trample"],
  text: "Trample\n{G}: Regenerate Silvos.",
  activated: [
    {
      cost: { mana: "{G}", tap: false },
      targets: [],
      effect: { kind: "regenerate", target: "source" },
      resolve: null,
      text: "{G}: Regenerate Silvos.",
    },
  ],
});
