import { defineCard } from "../define.js";

// EDHREC rank 15558.

const TEXT =
  "Conjure Elemental — {8}: Untap target land you control. It becomes an 8/8 Elemental creature with trample and haste until end of turn. It's still a land.";

export default defineCard({
  name: "Silvanus's Invoker",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Dragon", "Druid"],
  power: 3,
  toughness: 2,
  text: TEXT,
  activated: [
    {
      cost: { mana: "{8}", tap: false },
      targets: ["land-you-control"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "untap", target: 0 },
          {
            kind: "animate",
            target: 0,
            power: 8,
            toughness: 8,
            addTypes: ["creature"],
            addSubtypes: ["Elemental"],
            keywords: ["trample", "haste"],
            duration: "end-of-turn",
          },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
