import { defineCard } from "../define.js";

// Whoever it's attacking pays and chooses, so the counter goes on an opponent's
// creature and the attack goes on to someone else. Only the player itself: attacking
// a planeswalker, nobody can activate this.
const ENTERS_TEXT = "This creature enters with X +1/+1 counters on it.";
const TEXT =
  "{2}: Put a +1/+1 counter on this creature, then you may reselect which player this creature is attacking. Only the player this creature is attacking may activate this ability and only during the declare attackers step. (It can't attack its controller.)";

export default defineCard({
  name: "Capricopian",
  manaCost: "{X}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Goat", "Hydra"],
  power: 0,
  toughness: 0,
  text: `${ENTERS_TEXT}\n${TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", counters: { kind: "+1/+1", amount: "x" } },
      text: ENTERS_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: "{2}", tap: false },
      anyPlayer: true,
      targets: [],
      condition: {
        kind: "all",
        of: [
          { kind: "turn-structure", steps: ["declare-attackers"] },
          { kind: "source", filter: { attackingYou: true } },
        ],
      },
      effect: {
        kind: "sequence",
        effects: [
          { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
          { kind: "reselect-attack", target: "source", onlyPlayers: true },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
