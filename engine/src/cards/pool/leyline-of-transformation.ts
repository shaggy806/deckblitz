import { defineCard } from "../define.js";

// EDHREC 3586 (batch 315). Begun on the battlefield from the opening hand
// (rule 103.6a), it still enters, so it chooses its creature type as it does
// (rule 614.12 — `Game.applyOpeningHand` asks before it moves). Replacement
// effects that modify creatures of a type as they enter see the chosen type
// (its ruling): the type is part of the creature as it enters.
const LEYLINE_TEXT = "If this card is in your opening hand, you may begin the game with it on the battlefield.";
const TEXT =
  "Creatures you control are the chosen type in addition to their other types. The same is true for creature spells you control and creature cards you own that aren't on the battlefield.";

export default defineCard({
  name: "Leyline of Transformation",
  manaCost: "{2}{U}{U}",
  colors: ["U"],
  types: ["enchantment"],
  beginsOnBattlefield: true,
  chooseCreatureTypeOnEnter: true,
  text: `${LEYLINE_TEXT}\nAs this enchantment enters, choose a creature type.\n${TEXT}`,
  static: [
    {
      affects: { scope: "creatures-you-control" },
      addsChosenCreatureType: true,
      outsideBattlefield: { ofType: ["creature"], addsChosenCreatureType: true },
      text: TEXT,
    },
  ],
});
