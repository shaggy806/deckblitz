import { defineCard } from "../define.js";

const ENTERS_TEXT = "When this creature enters, up to two target creatures can't block this turn.";

export default defineCard({
  name: "Glarewielder",
  manaCost: "{4}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Elemental", "Shaman"],
  power: 3,
  toughness: 1,
  keywords: ["haste"],
  evoke: { cost: "{1}{R}" },
  text: `Haste\n${ENTERS_TEXT}\nEvoke {1}{R} (You may cast this spell for its evoke cost. If you do, it's sacrificed when it enters.)`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [
        { kind: "optional", of: "creature" },
        { kind: "optional", of: { kind: "other", of: "creature", than: { slots: [0] } } },
      ],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "restrict", target: 0, restrictions: ["cant-block"] },
          { kind: "restrict", target: 1, restrictions: ["cant-block"] },
        ],
      },
      resolve: null,
      text: ENTERS_TEXT,
    },
  ],
});
