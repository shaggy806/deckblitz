import { defineCard } from "../define.js";

const TEXT =
  "Magecraft — Whenever you cast or copy an instant or sorcery spell, this creature gains your choice of flying or lifelink until end of turn.";

export default defineCard({
  name: "Silverquill Pledgemage",
  manaCost: "{1}{W/B}{W/B}",
  colors: ["W", "B"],
  types: ["creature"],
  subtypes: ["Vampire", "Cleric"],
  power: 3,
  toughness: 1,
  text: TEXT,
  triggered: [
    {
      trigger: {
        on: "cast-spell",
        who: "you",
        orCopy: true,
        filter: { typesAnyOf: ["instant", "sorcery"] },
      },
      targets: [],
      // "Your choice of" is chosen as the ability resolves.
      effect: {
        kind: "modal",
        minModes: 1,
        maxModes: 1,
        modes: [
          {
            text: "Flying",
            effect: { kind: "grant-keyword", target: "source", keyword: "flying", duration: "end-of-turn" },
          },
          {
            text: "Lifelink",
            effect: { kind: "grant-keyword", target: "source", keyword: "lifelink", duration: "end-of-turn" },
          },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
