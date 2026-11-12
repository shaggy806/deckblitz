import { defineCard } from "../define.js";

// EDHREC rank 13422. "Each player who discarded a card this turn" counts the
// players with a discard in this turn's journal, Azula's own included.

const ATTACK_TEXT =
  "Whenever Azula attacks, you may discard a card. Then you get an experience counter for each player who discarded a card this turn.";
const PUMP_TEXT =
  "{2}{B}: Until end of turn, Azula gets +1/+1 for each experience counter you have and gains menace.";

export default defineCard({
  name: "Azula, Ruthless Firebender",
  manaCost: "{2}{B}",
  colors: ["B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Noble"],
  power: 3,
  toughness: 3,
  text: `Firebending 1 (Whenever this creature attacks, add {R}. This mana lasts until end of combat.)\n${ATTACK_TEXT}\n${PUMP_TEXT}`,
  activated: [
    {
      cost: { mana: "{2}{B}", tap: false },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          {
            kind: "modify-pt",
            target: "source",
            power: { playerCounters: "experience" },
            toughness: { playerCounters: "experience" },
            duration: "end-of-turn",
          },
          { kind: "grant-keyword", target: "source", keyword: "menace", duration: "end-of-turn" },
        ],
      },
      resolve: null,
      text: PUMP_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: { kind: "add-mana", mana: "R", amount: 1, untilEndOfCombat: true },
      resolve: null,
      firebending: true,
      text: "Firebending 1 (Whenever this creature attacks, add {R}. This mana lasts until end of combat.)",
    },
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "may", prompt: "Discard a card?", effect: { kind: "discard", target: "you", amount: 1 } },
          {
            kind: "add-player-counters",
            counter: "experience",
            amount: {
              countPlayers: "each-player",
              where: { kind: "of-player", player: "that-player", condition: { kind: "turn-history", what: "discarded" } },
            },
          },
        ],
      },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
});
