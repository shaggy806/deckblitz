import { defineCard } from "../define.js";

// EDHREC rank 16455. The look comes first (the opponent chosen among two or
// more), then any card name — one in that hand or not.

const NAME = "As this artifact enters, look at an opponent's hand, then choose any card name.";
const LOCK = "Activated abilities of sources with the chosen name can't be activated unless they're mana abilities.";

export default defineCard({
  name: "Sorcerous Spyglass",
  manaCost: "{2}",
  colors: [],
  types: ["artifact"],
  text: `${NAME}\n${LOCK}`,
  chooseCardNameOnEnter: { aim: "opponent-permanents", look: "opponent-hand" },
  static: [
    {
      affects: { scope: "self" },
      prohibits: {
        who: "each-player",
        abilitiesOf: { chosenName: true },
        anyZone: true,
        exceptManaAbilities: true,
      },
      text: LOCK,
    },
  ],
});
