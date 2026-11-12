import { defineCard } from "../define.js";

// EDHREC rank 2517.
//
// Rulings: the first ability prevents all damage that would be dealt to you
// this turn after it resolves, even if Selfless Squire leaves. The second
// triggers on any prevention of damage to you, not only the first ability's
// (`damage-to-player-prevented`, protection's included).
const ENTERS = "When this creature enters, prevent all damage that would be dealt to you this turn.";
const PREVENTED = "Whenever damage that would be dealt to you is prevented, put that many +1/+1 counters on this creature.";

export default defineCard({
  name: "Selfless Squire",
  manaCost: "{3}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Soldier"],
  power: 1,
  toughness: 1,
  keywords: ["flash"],
  text: `Flash\n${ENTERS}\n${PREVENTED}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "damage-rule", to: { players: "you" } },
      resolve: null,
      text: ENTERS,
    },
    {
      trigger: { on: "event", event: "damage-to-player-prevented", who: "you" },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: { triggerValue: true } },
      resolve: null,
      text: PREVENTED,
    },
  ],
});
