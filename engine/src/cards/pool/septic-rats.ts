import { defineCard } from "../define.js";

// Mirrodin Besieged. An attack trigger's "that player" is the defending
// player; "is poisoned" is one or more poison counters (rule 122.1f). The
// intervening-if (rule 603.4) is asked as it attacks and again as it resolves.

const INFECT =
  "Infect (This creature deals damage to creatures in the form of -1/-1 counters and to players in the form of poison counters.)";
const TEXT = "Whenever this creature attacks, if defending player is poisoned, it gets +1/+1 until end of turn.";

export default defineCard({
  name: "Septic Rats",
  manaCost: "{1}{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Phyrexian", "Rat"],
  power: 2,
  toughness: 2,
  keywords: ["infect"],
  text: `${INFECT}\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      condition: {
        kind: "of-player",
        player: "that-player",
        condition: { kind: "player-counters", counter: "poison", who: "you", atLeast: 1 },
      },
      targets: [],
      effect: { kind: "modify-pt", target: "source", power: 1, toughness: 1, duration: "end-of-turn" },
      resolve: null,
      text: TEXT,
    },
  ],
});
