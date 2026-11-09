import { defineCard } from "../define.js";

// EDHREC rank 14082. Only the graveyard: nothing on the battlefield changes.
export default defineCard({
  name: "Ashes of the Fallen",
  manaCost: "{2}",
  colors: [],
  types: ["artifact"],
  chooseCreatureTypeOnEnter: true,
  text: "As this artifact enters, choose a creature type.\nEach creature card in your graveyard has the chosen creature type in addition to its other types.",
  static: [
    {
      affects: { scope: "self" },
      outsideBattlefield: { ofType: ["creature"], zones: ["graveyard"], addsChosenCreatureType: true },
      text: "Each creature card in your graveyard has the chosen creature type in addition to its other types.",
    },
  ],
});
