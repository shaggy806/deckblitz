import { defineCard } from "../define.js";

// EDHREC rank 10365.
//
// The opponent is the only target; the creature card is picked at random as the ability
// resolves (the rulings) — `choose-random-card` over target 0's graveyard.

const TEXT =
  "{T}: Choose a creature card at random from target opponent's graveyard. Put that card onto the battlefield under your control.";

export default defineCard({
  name: "Tariel, Reckoner of Souls",
  manaCost: "{4}{R}{W}{B}",
  colors: ["W", "B", "R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Angel"],
  power: 4,
  toughness: 7,
  keywords: ["flying", "vigilance"],
  text: `Flying, vigilance\n${TEXT}`,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: ["opponent"],
      effect: {
        kind: "choose-random-card",
        zone: "graveyard",
        whose: 0,
        filter: { type: "creature" },
        then: { kind: "put-onto-battlefield", target: 0, underYourControl: true },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
