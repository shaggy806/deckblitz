import { defineCard } from "../define.js";
import { equip } from "../helpers.js";

const ATTACK_TEXT =
  "Whenever equipped creature attacks, sacrifice Karlov's Crossbow and destroy target creature an opponent controls.";
const FORECAST_TEXT =
  "Forecast — {0}, Reveal Karlov's Crossbow from your hand: For the remainder of the game, spells you cast named Karlov's Crossbow cost {1} less to cast. (Activate only during your upkeep and only once each turn.)";

export default defineCard({
  name: "Karlov's Crossbow",
  manaCost: "{5}",
  colors: [],
  types: ["artifact"],
  subtypes: ["Equipment"],
  text: `${ATTACK_TEXT}\nEquip {1}\n${FORECAST_TEXT}`,
  triggered: [
    {
      trigger: { on: "attacks", who: "attached" },
      targets: ["creature-an-opponent-controls"],
      effect: {
        kind: "sequence",
        effects: [{ kind: "sacrifice-source" }, { kind: "destroy", target: 0 }],
      },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
  activated: [
    equip("{1}"),
    {
      // Forecast (rule 702.57): from the hand, revealed, during your upkeep, once each turn.
      cost: { mana: "{0}", tap: false },
      targets: [],
      effect: {
        kind: "player-effect",
        duration: "permanent",
        reduceSpells: { applies: { name: "Karlov's Crossbow" }, reduceGeneric: 1 },
      },
      resolve: null,
      text: FORECAST_TEXT,
      zone: "hand",
      staysInZone: true,
      oncePerTurn: true,
      condition: { kind: "all", of: [{ kind: "your-turn" }, { kind: "turn-structure", steps: ["upkeep"] }] },
    },
  ],
});
