import { defineCard } from "../define.js";

const RETURN =
  "{B}{B}{B}, Exile Balthor: Each player returns all black and all red creature cards from their graveyard to the battlefield.";

export default defineCard({
  name: "Balthor the Defiled",
  manaCost: "{2}{B}{B}",
  colors: ["B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Zombie", "Dwarf"],
  power: 2,
  toughness: 2,
  text: `Minion creatures get +1/+1.\n${RETURN}`,
  static: [
    {
      affects: { scope: "filter", filter: { type: "creature", subtype: "Minion" } },
      grantPt: [1, 1],
      text: "Minion creatures get +1/+1.",
    },
  ],
  activated: [
    {
      cost: { mana: "{B}{B}{B}", tap: false, exileSelf: true },
      targets: [],
      effect: {
        kind: "return-from-graveyard",
        from: "each-graveyard",
        filter: { type: "creature", anyOf: [{ colors: ["B"] }, { colors: ["R"] }] },
        destination: "battlefield",
        count: "all",
      },
      resolve: null,
      text: RETURN,
    },
  ],
});
