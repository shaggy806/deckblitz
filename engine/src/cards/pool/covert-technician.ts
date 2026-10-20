import { defineCard } from "../define.js";
import { ninjutsu, ninjutsuText } from "../helpers.js";

// EDHREC rank 10450. Ninjutsu's rulings are the keyword's (the Ninja enters
// attacking whoever the returned creature was; it was never declared).
// "That damage" is the trigger's value, the combat damage it dealt (Old
// Gnawbone, Glamdring); the artifact card is chosen from the hand as it
// resolves (Broodcaller Scourge's shape).

const TEXT =
  "Whenever this creature deals combat damage to a player, you may put an artifact card with mana value less than or equal to that damage from your hand onto the battlefield.";

export default defineCard({
  name: "Covert Technician",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["artifact", "creature"],
  subtypes: ["Human", "Ninja"],
  power: 2,
  toughness: 4,
  text: `${ninjutsuText("{1}{U}")}\n${TEXT}`,
  activated: [ninjutsu("{1}{U}")],
  triggered: [
    {
      trigger: { on: "deals-combat-damage-to-player", who: "self" },
      targets: [],
      effect: {
        kind: "look-and-choose",
        zone: "hand",
        min: 0,
        max: 1,
        destination: "battlefield",
        leftover: "stay",
        filter: { type: "artifact", manaValue: { op: "lte", n: { amount: { triggerValue: true } } } },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
