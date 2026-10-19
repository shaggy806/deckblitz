import { defineCard } from "../define.js";

const ETB_TEXT = "When this creature enters, if it was kicked, it gets +1/+1 and gains haste until end of turn.";

export default defineCard({
  name: "Yavimaya Iconoclast",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Elf"],
  power: 3,
  toughness: 2,
  keywords: ["trample"],
  text: `Kicker {R} (You may pay an additional {R} as you cast this spell.)\nTrample\n${ETB_TEXT}`,
  kicker: { cost: "{R}" },
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      condition: { kind: "self-kicked" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "modify-pt", target: "source", power: 1, toughness: 1, duration: "end-of-turn" },
          { kind: "grant-keyword", target: "source", keyword: "haste", duration: "end-of-turn" },
        ],
      },
      resolve: null,
      text: ETB_TEXT,
    },
  ],
});
