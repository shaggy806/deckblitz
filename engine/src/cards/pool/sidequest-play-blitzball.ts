import { defineCard } from "../define.js";

// EDHREC rank 11354. A transforming enchantment (Sidequest: Raise a
// Chocobo's shape) whose back face is an Equipment.
//
// "If a player was dealt 6 or more combat damage this turn" is one player's
// own total, never summed over players, yours included (`turn-stat`,
// `any-player`) — an intervening-if (rule 603.4). "At end of combat" is the
// end of combat step beginning (rule 511.2). "Attach it to a creature you
// control" targets nothing: the creature is chosen as it resolves, after the
// transform (Dissection Tools' `choose-permanents` → `attach`), and with none
// it stays unattached.
const PUMP_TEXT = "At the beginning of combat on your turn, target creature you control gets +2/+0 until end of turn.";
const TRANSFORM_TEXT =
  "At the end of combat on your turn, if a player was dealt 6 or more combat damage this turn, transform this enchantment, then attach it to a creature you control.";

export default defineCard({
  name: "Sidequest: Play Blitzball",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["enchantment"],
  text: `${PUMP_TEXT}\n${TRANSFORM_TEXT}`,
  triggered: [
    {
      trigger: { on: "step-begins", step: "begin-combat", who: "you" },
      targets: ["creature-you-control"],
      effect: { kind: "modify-pt", target: 0, power: 2, toughness: 0, duration: "end-of-turn" },
      resolve: null,
      text: PUMP_TEXT,
    },
    {
      trigger: { on: "step-begins", step: "end-combat", who: "you" },
      condition: { kind: "turn-stat", stat: "combat-damage-taken", who: "any-player", atLeast: 6 },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "transform", target: "source" },
          {
            kind: "choose-permanents",
            filter: { type: "creature", controlledBy: "you" },
            min: 1,
            upTo: 1,
            then: { kind: "attach", target: 0 },
            prompt: "Attach World Champion, Celestial Weapon to a creature you control",
          },
        ],
      },
      resolve: null,
      text: TRANSFORM_TEXT,
    },
  ],
  faces: ["Sidequest: Play Blitzball", "World Champion, Celestial Weapon"],
  transform: true,
});
