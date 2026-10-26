import { defineCard } from "../define.js";

const ABILITY_TEXT =
  "{T}, Exile a Treefolk card from your graveyard: Search your library for up to two Forest cards, put them onto the battlefield tapped, then shuffle.";

export default defineCard({
  name: "Everbark Shaman",
  manaCost: "{4}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Treefolk", "Shaman"],
  power: 3,
  toughness: 5,
  text: ABILITY_TEXT,
  activated: [
    {
      cost: { mana: null, tap: true, exileFromGraveyard: { count: 1, filter: { subtype: "Treefolk" } } },
      targets: [],
      effect: {
        kind: "search-library",
        filter: { type: "land", subtype: "Forest" },
        destination: "battlefield",
        min: 0,
        max: 2,
        enterTapped: true,
      },
      resolve: null,
      text: ABILITY_TEXT,
    },
  ],
});
