import { defineCard } from "../define.js";

// Star Trek Commander (TRC). "Whenever you attack" is once per declaration;
// X counts the opponents attacked this turn as it resolves.

const ETB_TEXT = "When Worf enters, create a 2/1 red Klingon Warrior creature token with haste.";
const ATTACK_TEXT =
  "Battlefront — Whenever you attack, exile the top X cards of your library, where X is the number of opponents you attacked this turn. Until the end of your next turn, you may play those cards.";

export default defineCard({
  name: "Worf, Defiant Commander",
  manaCost: "{2}{R}{W}{B}",
  colors: ["R", "W", "B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Klingon", "Warrior", "Officer"],
  power: 3,
  toughness: 4,
  text: `${ETB_TEXT}\n${ATTACK_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Klingon Warrior Token", count: 1 },
      resolve: null,
      text: ETB_TEXT,
    },
    {
      trigger: { on: "attack-with", who: "you", atLeast: 1 },
      targets: [],
      effect: { kind: "impulse-exile", amount: { turnStat: "opponents-attacked" }, duration: "your-next-turn" },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
});
