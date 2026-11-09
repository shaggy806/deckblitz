import { defineCard } from "../define.js";

const TYPE_TEXT =
  "Slivers you control and nontoken creatures you control are the chosen type in addition to their other creature types. The same is true for creature spells you control and creature cards you own that aren't on the battlefield.";
const TOKEN_TEXT = "{3}, {T}: Create a 1/1 colorless Sliver creature token.";

export default defineCard({
  name: "Rukarumel, Biologist",
  manaCost: "{W}{U}{B}{R}{G}",
  colors: ["W", "U", "B", "R", "G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Wizard"],
  power: 3,
  toughness: 3,
  text: `As Rukarumel enters, choose a creature type.\n${TYPE_TEXT}\n${TOKEN_TEXT}`,
  chooseCreatureTypeOnEnter: true,
  static: [
    {
      affects: {
        scope: "filter",
        filter: { type: "creature", controlledBy: "you", anyOf: [{ subtype: "Sliver" }, { token: false }] },
      },
      addsChosenCreatureType: true,
      outsideBattlefield: { ofType: ["creature"], addsChosenCreatureType: true },
      text: TYPE_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: "{3}", tap: true },
      targets: [],
      effect: { kind: "create-token", token: "Sliver Token", count: 1 },
      resolve: null,
      text: TOKEN_TEXT,
    },
  ],
});
