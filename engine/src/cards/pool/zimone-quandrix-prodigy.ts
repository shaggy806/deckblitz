import { defineCard } from "../define.js";

// EDHREC rank 6879.
//
// Rulings:
//   [2021-04-16] Zimone's last ability counts the number of lands you control as it resolves, not
//     as you activate it.
//   [2021-04-16] Zimone's first ability isn't the same as playing a land. As it resolves, you may
//     put a land card from your hand onto the battlefield tapped even if you have no available
//     land plays or it's another player's turn.
//
// Horizon of Progress's land drop (not a land play), and Tezzeret, Artifice
// Master's "draw two instead", its count read as the ability resolves.

const LAND_TEXT = "{1}, {T}: You may put a land card from your hand onto the battlefield tapped.";
const DRAW_TEXT = "{4}, {T}: Draw a card. If you control eight or more lands, draw two cards instead.";

export default defineCard({
  name: "Zimone, Quandrix Prodigy",
  manaCost: "{G}{U}",
  colors: ["G", "U"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Wizard"],
  power: 1,
  toughness: 2,
  text: `${LAND_TEXT}\n${DRAW_TEXT}`,
  activated: [
    {
      cost: { mana: "{1}", tap: true },
      targets: [],
      effect: {
        kind: "look-and-choose",
        zone: "hand",
        min: 0,
        max: 1,
        destination: "battlefield",
        enterTapped: true,
        leftover: "stay",
        filter: { type: "land" },
      },
      resolve: null,
      text: LAND_TEXT,
    },
    {
      cost: { mana: "{4}", tap: true },
      targets: [],
      effect: {
        kind: "conditional",
        condition: { kind: "controls", filter: { type: "land" }, atLeast: 8 },
        then: { kind: "draw", amount: 2 },
        else: { kind: "draw", amount: 1 },
      },
      resolve: null,
      text: DRAW_TEXT,
    },
  ],
});
