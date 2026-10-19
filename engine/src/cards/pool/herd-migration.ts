import { defineCard } from "../define.js";

const DOMAIN_TEXT =
  "Domain — Create a 3/3 green Beast creature token for each basic land type among lands you control.";
const FETCH_TEXT =
  "{1}{G}, Discard this card: Search your library for a basic land card, reveal it, put it into your hand, then shuffle. You gain 3 life.";

export default defineCard({
  name: "Herd Migration",
  manaCost: "{6}{G}",
  colors: ["G"],
  types: ["sorcery"],
  text: `${DOMAIN_TEXT}\n${FETCH_TEXT}`,
  targets: [],
  effect: { kind: "create-token", token: "3/3 Beast Token", count: { basicLandTypes: "you" } },
  activated: [
    {
      cost: { mana: "{1}{G}", tap: false },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          {
            kind: "search-library",
            filter: { supertype: "basic", type: "land" },
            destination: "hand",
            min: 0,
            max: 1,
            reveal: true,
          },
          { kind: "gain-life", amount: 3 },
        ],
      },
      resolve: null,
      text: FETCH_TEXT,
      zone: "hand",
    },
  ],
});
