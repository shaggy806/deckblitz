import { defineCard } from "../define.js";

// Rulings: the search may find nothing; a Dragon still phased out at the end
// step isn't exiled.
const TUTOR =
  "{1}{R}{R}, {T}: Search your library for a Dragon permanent card, put that card onto the battlefield, then shuffle. That Dragon gains haste until end of turn. Exile it at the beginning of the next end step.";

export default defineCard({
  name: "Zirilan of the Claw",
  manaCost: "{3}{R}{R}",
  colors: ["R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Lizard", "Shaman"],
  power: 3,
  toughness: 4,
  text: TUTOR,
  activated: [
    {
      cost: { mana: "{1}{R}{R}", tap: true },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          {
            kind: "search-library",
            filter: { subtype: "Dragon", notTypes: ["instant", "sorcery"] },
            destination: "battlefield",
            min: 0,
            max: 1,
          },
          {
            kind: "grant-keyword-all",
            filter: { thisWay: "put-onto-battlefield" },
            keyword: "haste",
            duration: "end-of-turn",
          },
          {
            kind: "delayed-trigger",
            at: "next-end-step",
            about: "put-onto-battlefield",
            effect: { kind: "exile", target: 0 },
            text: "Exile it at the beginning of the next end step.",
          },
        ],
      },
      resolve: null,
      text: TUTOR,
    },
  ],
});
