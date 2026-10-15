import { defineCard } from "../define.js";

// EDHREC rank 10622.
//
// Rulings:
//   [2025-06-06] If the target card is an illegal target as Ignis Scientia's last ability
//     resolves, it won't resolve and none of its effects will happen. You won't create a Food
//     token even if the target card was a creature card.
const ENTER_TEXT =
  "When Ignis Scientia enters, look at the top six cards of your library. You may put a land card from among them onto the battlefield tapped. Put the rest on the bottom of your library in a random order.";
const RECIPE_TEXT =
  "I've Come Up with a New Recipe! — {1}{G}{U}, {T}: Exile target card from a graveyard. If a creature card was exiled this way, create a Food token.";

export default defineCard({
  name: "Ignis Scientia",
  manaCost: "{1}{G}{U}",
  colors: ["U", "G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Advisor"],
  power: 2,
  toughness: 2,
  text: `${ENTER_TEXT}\n${RECIPE_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "look-and-choose",
        zone: "library",
        count: 6,
        min: 0,
        max: 1,
        filter: { type: "land" },
        destination: "battlefield",
        enterTapped: true,
        leftover: "bottom-random",
      },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: "{1}{G}{U}", tap: true },
      targets: [{ kind: "card-in-graveyard", whose: "any" }],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "exile", target: 0 },
          {
            kind: "conditional",
            condition: { kind: "this-way", what: "exiled", filter: { type: "creature" } },
            then: { kind: "create-token", token: "Food Token", count: 1 },
          },
        ],
      },
      resolve: null,
      text: RECIPE_TEXT,
    },
  ],
});
