import { defineCard } from "../define.js";
import { searchZonesAndOr } from "../helpers.js";

const MILL_TEXT = "Mill three cards. Then you may return a creature or land card from your graveyard to your hand.";
const ACTIVATE_TEXT =
  "Exile this card and two other cards named Say Its Name from your graveyard: Search your graveyard, hand, and/or library for a card named Altanak, the Thrice-Called and put it onto the battlefield. If you search your library this way, shuffle. Activate only as a sorcery.";

export default defineCard({
  name: "Say Its Name",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["sorcery"],
  text: `${MILL_TEXT}\n${ACTIVATE_TEXT}`,
  effect: {
    kind: "sequence",
    effects: [
      { kind: "mill", target: "you", amount: 3 },
      {
        kind: "look-and-choose",
        zone: "graveyard",
        min: 0,
        max: 1,
        destination: "hand",
        leftover: "stay",
        filter: { typesAnyOf: ["creature", "land"] },
      },
    ],
  },
  activated: [
    {
      cost: {
        mana: null,
        tap: false,
        exileSelf: true,
        exileFromGraveyard: { count: 2, filter: { name: "Say Its Name" } },
      },
      zone: "graveyard",
      sorcerySpeed: true,
      targets: [],
      effect: searchZonesAndOr(["graveyard", "hand", "library"], {
        kind: "search-library",
        filter: { name: "Altanak, the Thrice-Called" },
        destination: "battlefield",
        min: 0,
        max: 1,
      }),
      resolve: null,
      text: ACTIVATE_TEXT,
    },
  ],
});
