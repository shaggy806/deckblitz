import { defineCard } from "../define.js";

const ATTACK = "Whenever you attack with two or more Spiders, put a +1/+1 counter on Spinneret and Spiderling.";
const DAMAGE =
  "Whenever Spinneret and Spiderling deals 4 or more damage, exile the top card of your library. Until the end of your next turn, you may play that card.";

export default defineCard({
  name: "Spinneret and Spiderling",
  manaCost: "{R}",
  colors: ["R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Spider", "Human", "Hero"],
  power: 1,
  toughness: 2,
  text: `${ATTACK}\n${DAMAGE}`,
  triggered: [
    {
      trigger: { on: "attack-with", who: "you", atLeast: 2, filter: { subtype: "Spider" } },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
      resolve: null,
      text: ATTACK,
    },
    {
      trigger: { on: "deals-damage", who: "self", atLeast: 4 },
      targets: [],
      effect: { kind: "impulse-exile", amount: 1, duration: "until-end-of-your-next-turn", play: true },
      resolve: null,
      text: DAMAGE,
    },
  ],
});
