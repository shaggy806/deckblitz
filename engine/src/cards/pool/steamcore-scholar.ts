import { defineCard } from "../define.js";

const TEXT =
  "When this creature enters, draw two cards. Then discard two cards unless you discard an instant or sorcery card or a creature card with flying.";

export default defineCard({
  name: "Steamcore Scholar",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Weird", "Detective"],
  power: 2,
  toughness: 2,
  keywords: ["flying", "vigilance"],
  text: `Flying, vigilance\n${TEXT}`,
  triggered: [
    {
      // Any two cards still answer, whatever they are (the ruling).
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "draw", amount: 2 },
          {
            kind: "discard",
            target: "you",
            amount: 2,
            unlessOne: { anyOf: [{ typesAnyOf: ["instant", "sorcery"] }, { type: "creature", keyword: "flying" }] },
          },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
