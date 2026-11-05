import { defineCard } from "../define.js";

// Every ability its controller activates, from any zone (cycling, ninjutsu, unearth too), not
// mana abilities, floored at one mana (Training Grounds' `leavesOneMana`).

const REDUCE_TEXT =
  "Abilities you activate that aren't mana abilities cost {2} less to activate. This effect can't reduce the mana in that cost to less than one mana.";
const BLOCK_TEXT = "{1}, {T}: Target creature can't block this turn.";

export default defineCard({
  name: "Zirda, the Dawnwaker",
  manaCost: "{1}{R/W}{R/W}",
  colors: ["R", "W"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Elemental", "Fox"],
  power: 3,
  toughness: 3,
  text:
    "Companion — Each permanent card in your starting deck has an activated ability. (If this card is your chosen companion, you may put it into your hand from outside the game for {3} as a sorcery.)\n" +
    `${REDUCE_TEXT}\n${BLOCK_TEXT}`,
  companion: { kind: "each-card", of: "permanent", test: { hasActivatedAbility: true } },
  static: [
    {
      affects: { scope: "self" },
      abilityCostModification: {
        applies: {},
        byYou: true,
        anyZone: true,
        exceptManaAbilities: true,
        reduceGeneric: 2,
        leavesOneMana: true,
      },
      text: REDUCE_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: "{1}", tap: true },
      targets: ["creature"],
      effect: { kind: "restrict", target: 0, restrictions: ["cant-block"] },
      resolve: null,
      text: BLOCK_TEXT,
    },
  ],
});
