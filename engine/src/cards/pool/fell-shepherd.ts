import { defineCard } from "../define.js";

const DAMAGE_TEXT =
  "Whenever this creature deals combat damage to a player, you may return to your hand all creature cards that were put into your graveyard from the battlefield this turn.";
const SAC_TEXT = "{B}, Sacrifice another creature: Target creature gets -2/-2 until end of turn.";

export default defineCard({
  name: "Fell Shepherd",
  manaCost: "{5}{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Avatar"],
  power: 8,
  toughness: 6,
  text: `${DAMAGE_TEXT}\n${SAC_TEXT}`,
  triggered: [
    {
      trigger: { on: "deals-combat-damage-to-player", who: "self" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Return to your hand all creature cards put into your graveyard from the battlefield this turn?",
        effect: {
          kind: "return-from-graveyard",
          filter: { type: "creature", putIntoGraveyardThisTurn: { from: ["battlefield"] } },
          destination: "hand",
          count: "all",
        },
      },
      resolve: null,
      text: DAMAGE_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: "{B}", tap: false, sacrifice: "creature-you-control" },
      otherOnly: true,
      targets: ["creature"],
      effect: { kind: "modify-pt", target: 0, power: -2, toughness: -2, duration: "end-of-turn" },
      resolve: null,
      text: SAC_TEXT,
    },
  ],
});
