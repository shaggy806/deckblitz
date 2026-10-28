import { defineCard } from "../define.js";

// EDHREC rank 6537. "Sources" reaches the named card in every zone — no
// cycling it in a hand, no graveyard ability (the rulings) — and a mana
// ability is spared. Only while the Needle is on the battlefield.

const NAME = "As this artifact enters, choose a card name.";
const LOCK = "Activated abilities of sources with the chosen name can't be activated unless they're mana abilities.";

export default defineCard({
  name: "Pithing Needle",
  manaCost: "{1}",
  colors: [],
  types: ["artifact"],
  text: `${NAME}\n${LOCK}`,
  chooseCardNameOnEnter: { aim: "opponent-permanents" },
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
