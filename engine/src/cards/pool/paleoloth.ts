import { defineCard } from "../define.js";

const TEXT =
  "Whenever another creature you control with power 5 or greater enters, you may return target creature card from your graveyard to your hand.";

export default defineCard({
  name: "Paleoloth",
  manaCost: "{4}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Beast"],
  power: 5,
  toughness: 5,
  text: TEXT,
  triggered: [
    {
      trigger: {
        on: "enters-battlefield",
        who: "you-control",
        filter: { type: "creature", power: { op: "gte", n: 5 } },
        otherOnly: true,
      },
      targets: [{ kind: "card-in-graveyard", whose: "you", filter: { type: "creature" } }],
      effect: {
        kind: "may",
        prompt: "Return target creature card from your graveyard to your hand?",
        effect: { kind: "return-to-hand", target: 0, from: "graveyard" },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
