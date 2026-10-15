import { defineCard } from "../define.js";

// EDHREC rank 12237.
// Rulings:
//   [2025-06-06] The bonus from Gran Pulse Ochu's last ability is determined at the time it
//     resolves. Once the ability resolves, the bonus applied by that instance of the ability
//     doesn't change even if the number of permanent cards in your graveyard changes.

const PUMP_TEXT = "{8}: Until end of turn, this creature gets +1/+1 for each permanent card in your graveyard.";

export default defineCard({
  name: "Gran Pulse Ochu",
  manaCost: "{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Plant", "Beast"],
  power: 1,
  toughness: 1,
  keywords: ["deathtouch"],
  text: `Deathtouch\n${PUMP_TEXT}`,
  activated: [
    {
      cost: { mana: "{8}", tap: false },
      targets: [],
      // The amount is read once as it resolves (the ruling): a fixed bonus.
      // A permanent card is one that isn't an instant or a sorcery.
      effect: {
        kind: "modify-pt",
        target: "source",
        power: { countInGraveyard: { notTypes: ["instant", "sorcery"], ownedBy: "you" } },
        toughness: { countInGraveyard: { notTypes: ["instant", "sorcery"], ownedBy: "you" } },
        duration: "end-of-turn",
      },
      resolve: null,
      text: PUMP_TEXT,
    },
  ],
});
