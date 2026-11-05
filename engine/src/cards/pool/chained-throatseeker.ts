import { defineCard } from "../define.js";


export default defineCard({
  name: "Chained Throatseeker",
  manaCost: "{5}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Phyrexian", "Horror"],
  power: 5,
  toughness: 5,
  keywords: ["infect"],
  text: "Infect (This creature deals damage to creatures in the form of -1/-1 counters and to players in the form of poison counters.)\nThis creature can't attack unless defending player is poisoned.",
  static: [
    {
      affects: { scope: "self" },
      cantAttackUnlessDefender: { holds: { kind: "player-counters", who: "you", counter: "poison", atLeast: 1 } },
      text: "This creature can't attack unless defending player is poisoned.",
    },
  ],
});
