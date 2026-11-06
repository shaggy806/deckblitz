import { defineCard } from "../define.js";
import { crew } from "../helpers.js";

// Mystery Booster Commander. Tlincalli Hunter's alternative cost, for any
// spell cast from exile, once during each of your turns.
const ALT = "Once during each of your turns, you may pay {0} rather than pay the mana cost for a spell you cast from exile.";
const DAMAGE =
  "Whenever Dragon's Smile deals combat damage to a player, that player exiles that many cards from the top of their library. You may play those cards this turn.";

export default defineCard({
  name: "Dragon's Smile",
  manaCost: "{5}{R}{R}",
  colors: ["R"],
  supertypes: ["legendary"],
  types: ["artifact"],
  subtypes: ["Vehicle"],
  power: 4,
  toughness: 5,
  keywords: ["flying"],
  text: `Flying\n${ALT}\n${DAMAGE}\nCrew 3`,
  static: [
    {
      affects: { scope: "self" },
      alternativeCostForSpells: { mana: "{0}", oncePerTurn: true, yourTurnOnly: true, fromZones: ["exile"] },
      text: ALT,
    },
  ],
  triggered: [
    {
      trigger: { on: "deals-combat-damage-to-player", who: "self" },
      targets: [],
      effect: { kind: "impulse-exile", amount: { triggerValue: true }, whose: "trigger-player", duration: "end-of-turn" },
      resolve: null,
      text: DAMAGE,
    },
  ],
  activated: [crew(3)],
});
