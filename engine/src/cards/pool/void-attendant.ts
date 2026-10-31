import { defineCard } from "../define.js";

// A processor's activation cost (`AbilityCost.putFromExile`): which card,
// chosen once the ability is on the stack (rules 602.2b, 601.2h) — nobody can
// remove it from exile in between (the ruling).

const ABILITY_TEXT =
  "{1}{G}, Put a card an opponent owns from exile into that player's graveyard: Create a 1/1 colorless Eldrazi Scion creature token. It has \"Sacrifice this token: Add {C}.\"";

export default defineCard({
  name: "Void Attendant",
  manaCost: "{2}{G}",
  colors: [],
  types: ["creature"],
  subtypes: ["Eldrazi", "Processor"],
  power: 2,
  toughness: 3,
  text: `Devoid (This card has no color.)\n${ABILITY_TEXT}`,
  activated: [
    {
      cost: { mana: "{1}{G}", tap: false, putFromExile: 1 },
      targets: [],
      effect: { kind: "create-token", token: "Eldrazi Scion Token", count: 1 },
      resolve: null,
      text: ABILITY_TEXT,
    },
  ],
});
