import { defineCard } from "../define.js";

const TEXT =
  "Battlefront — Whenever you attack, put a +1/+1 counter on each of up to X target creatures you control, where X is the number of opponents you attacked this turn.";

export default defineCard({
  name: "Martok, Hero of the Empire",
  manaCost: "{2}{W}",
  colors: ["W"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Klingon", "Warrior"],
  power: 2,
  toughness: 2,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "attack-with", who: "you", atLeast: 1 },
      targets: [{ kind: "any-number", of: "creature-you-control", max: { turnStat: "opponents-attacked" } }],
      effect: {
        kind: "for-each-target",
        from: 0,
        effect: { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 },
        simultaneous: true,
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
