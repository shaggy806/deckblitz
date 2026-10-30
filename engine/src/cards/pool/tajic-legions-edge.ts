import { defineCard } from "../define.js";

// EDHREC rank 8021.

export default defineCard({
  name: "Tajic, Legion's Edge",
  manaCost: "{1}{R}{W}",
  colors: ["W", "R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Soldier"],
  power: 3,
  toughness: 2,
  keywords: ["haste"],
  text: "Haste\nMentor (Whenever this creature attacks, put a +1/+1 counter on target attacking creature with lesser power.)\nPrevent all noncombat damage that would be dealt to other creatures you control.\n{R}{W}: Tajic gains first strike until end of turn.",
  activated: [
    {
      cost: { mana: "{R}{W}", tap: false },
      targets: [],
      effect: {
        kind: "grant-keyword",
        target: "source",
        keyword: "first-strike",
        duration: "end-of-turn",
      },
      resolve: null,
      text: "{R}{W}: Tajic gains first strike until end of turn.",
    },
  ],
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [
        {
          kind: "permanent",
          filter: {
            type: "creature",
            attacking: true,
            power: { op: "lt", n: { amount: { powerOf: "source" } } },
          },
        },
      ],
      effect: { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 },
      resolve: null,
      text: "Mentor (Whenever this creature attacks, put a +1/+1 counter on target attacking creature with lesser power.)",
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      replacement: {
        event: "would-deal-damage",
        combat: false,
        prevent: true,
        toFilter: { type: "creature", controlledBy: "you" },
        toOther: true,
      },
      text: "Prevent all noncombat damage that would be dealt to other creatures you control.",
    },
  ],
});
