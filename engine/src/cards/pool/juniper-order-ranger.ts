import { defineCard } from "../define.js";

const TEXT =
  "Whenever another creature you control enters, put a +1/+1 counter on that creature and a +1/+1 counter on this creature.";

// Either one gone by resolution, the other still gets its counter (the
// ruling): each step acts on its own object.
export default defineCard({
  name: "Juniper Order Ranger",
  manaCost: "{3}{G}{W}",
  colors: ["W", "G"],
  types: ["creature"],
  subtypes: ["Human", "Knight", "Ranger"],
  power: 2,
  toughness: 4,
  text: TEXT,
  triggered: [
    {
      trigger: {
        on: "enters-battlefield",
        who: "you-control",
        filter: { type: "creature" },
        otherOnly: true,
      },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "add-counter", target: "trigger-object", counter: "+1/+1", amount: 1 },
          { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
