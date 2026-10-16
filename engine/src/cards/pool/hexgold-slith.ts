import { defineCard } from "../define.js";

// EDHREC rank 23589. Modern Horizons 3. "You may pay {E}{E}. If you do" is
// a `may` with `costEnergy` (Assaultron Dominator), paid as it resolves.

const ENTER_TEXT = "When this creature enters, you get {E}{E} (two energy counters).";
const ATTACK_TEXT =
  "Whenever this creature attacks, you may pay {E}{E}. If you do, it gains first strike until end of turn.";
const DAMAGE_TEXT = "Whenever this creature deals combat damage to a player, put a +1/+1 counter on it.";

export default defineCard({
  name: "Hexgold Slith",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Slith"],
  power: 2,
  toughness: 1,
  text: `${ENTER_TEXT}\n${ATTACK_TEXT}\n${DAMAGE_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "get-energy", amount: 2 },
      resolve: null,
      text: ENTER_TEXT,
    },
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Pay {E}{E} to give this creature first strike until end of turn?",
        costEnergy: 2,
        effect: { kind: "grant-keyword", target: "source", keyword: "first-strike", duration: "end-of-turn" },
      },
      resolve: null,
      text: ATTACK_TEXT,
    },
    {
      trigger: { on: "deals-combat-damage-to-player", who: "self" },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
      resolve: null,
      text: DAMAGE_TEXT,
    },
  ],
});
