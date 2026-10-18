import { defineCard } from "../define.js";

// EDHREC rank 22400. March of the Machine.
//
// Whether it's attacking a battle is asked as the ability resolves.

const TEXT =
  "Whenever you attack, target attacking creature gets +1/+1 until end of turn. If it's attacking a battle, put a +1/+1 counter on it instead.";

export default defineCard({
  name: "Rampaging Geoderm",
  manaCost: "{2}{R}{G}",
  colors: ["R", "G"],
  types: ["creature"],
  subtypes: ["Dinosaur", "Beast"],
  power: 3,
  toughness: 3,
  keywords: ["trample", "haste"],
  text: `Trample, haste\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "attack-with", who: "you", atLeast: 1 },
      targets: [{ kind: "permanent", filter: { type: "creature", attacking: true } }],
      effect: {
        kind: "conditional",
        condition: { kind: "target", index: 0, filter: { attackingBattle: true } },
        then: { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 },
        else: { kind: "modify-pt", target: 0, power: 1, toughness: 1, duration: "end-of-turn" },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
