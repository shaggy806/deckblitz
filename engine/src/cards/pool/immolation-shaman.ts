import { defineCard } from "../define.js";

// EDHREC rank 7665. Runic Armasaur's trigger: a permanent's ability only, not
// a card's in a hand or graveyard (the rulings), never a mana ability.

const TRIGGER_TEXT =
  "Whenever an opponent activates an ability of an artifact, creature, or land that isn't a mana ability, this creature deals 1 damage to that player.";
const PUMP_TEXT = "{3}{R}{R}: This creature gets +3/+3 and gains menace until end of turn.";

export default defineCard({
  name: "Immolation Shaman",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Lizard", "Shaman"],
  power: 1,
  toughness: 3,
  text: `${TRIGGER_TEXT}\n${PUMP_TEXT}`,
  triggered: [
    {
      trigger: {
        on: "activates-ability",
        who: "opponent",
        source: { typesAnyOf: ["artifact", "creature", "land"] },
      },
      targets: [],
      effect: { kind: "damage", amount: 1, who: "trigger-player" },
      resolve: null,
      text: TRIGGER_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: "{3}{R}{R}", tap: false },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "modify-pt", target: "source", power: 3, toughness: 3, duration: "end-of-turn" },
          { kind: "grant-keyword", target: "source", keyword: "menace", duration: "end-of-turn" },
        ],
      },
      resolve: null,
      text: PUMP_TEXT,
    },
  ],
});
