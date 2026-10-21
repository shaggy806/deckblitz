import { defineCard } from "../define.js";

// "This effect lasts as long as that land remains on the battlefield" is a
// `"permanent"` animation: it ends with the object (rule 400.7).

export default defineCard({
  name: "Wakeroot Elemental",
  manaCost: "{4}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Elemental"],
  power: 5,
  toughness: 5,
  text: "{G}{G}{G}{G}{G}: Untap target land you control. It becomes a 5/5 Elemental creature with haste. It's still a land. (This effect lasts as long as that land remains on the battlefield.)",
  activated: [
    {
      cost: { mana: "{G}{G}{G}{G}{G}", tap: false },
      targets: ["land-you-control"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "untap", target: 0 },
          {
            kind: "animate",
            target: 0,
            power: 5,
            toughness: 5,
            addTypes: ["creature"],
            addSubtypes: ["Elemental"],
            keywords: ["haste"],
            duration: "permanent",
          },
        ],
      },
      resolve: null,
      text: "{G}{G}{G}{G}{G}: Untap target land you control. It becomes a 5/5 Elemental creature with haste. It's still a land.",
    },
  ],
});
