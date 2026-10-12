import { defineCard } from "../define.js";

// EDHREC rank 9037.

const ENTER_TEXT =
  "When Lluwen enters, mill four cards, then you may put a creature or land card from among the milled cards on top of your library.";
const WORM_TEXT =
  "{2}{B/G}{B/G}{B/G}, {T}, Discard a land card: Create a 1/1 black and green Worm creature token for each land card in your graveyard.";

export default defineCard({
  name: "Lluwen, Imperfect Naturalist",
  manaCost: "{B/G}{B/G}",
  colors: ["B", "G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Elf", "Druid"],
  power: 1,
  toughness: 3,
  text: `${ENTER_TEXT}\n${WORM_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "mill", target: "you", amount: 4 },
          {
            kind: "look-and-choose",
            zone: "graveyard",
            min: 0,
            max: 1,
            destination: "library-top",
            leftover: "stay",
            filter: { thisWay: "milled", typesAnyOf: ["creature", "land"] },
          },
        ],
      },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
  activated: [
    {
      // The land discarded for the cost is in the graveyard by the time the
      // ability resolves, so it counts.
      cost: { mana: "{2}{B/G}{B/G}{B/G}", tap: true, discard: { count: 1, filter: { type: "land" } } },
      targets: [],
      effect: {
        kind: "create-token",
        token: "Worm Token",
        count: { countInGraveyard: { type: "land", ownedBy: "you" } },
      },
      resolve: null,
      text: WORM_TEXT,
    },
  ],
});
