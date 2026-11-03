import { defineCard } from "../define.js";

const TEXT =
  "{T}: You may cast a spell with suspend from your hand. If you do, pay its suspend cost rather than its mana cost. Activate only as a sorcery.";

/** The suspend cost as an alternative cost (rule 118.9): a card with no mana
 * cost can be cast this way too (118.6a, Ancestral Vision), and it is an
 * ordinary cast, with no time counters and no haste. */
export default defineCard({
  name: "The Face of Boe",
  manaCost: "{1}{U}{R}{W}",
  colors: ["U", "R", "W"],
  types: ["creature"],
  supertypes: ["legendary"],
  subtypes: ["Alien", "Advisor"],
  power: 0,
  toughness: 4,
  text: TEXT,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "cast-now", from: "hand", spell: { hasSuspend: true }, suspendCost: true },
      sorcerySpeed: true,
      resolve: null,
      text: TEXT,
    },
  ],
});
