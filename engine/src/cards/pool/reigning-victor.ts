import { defineCard } from "../define.js";

export default defineCard({
  name: "Reigning Victor",
  manaCost: "{2/R}{2/W}{2/B}",
  colors: ["W", "B", "R"],
  types: ["creature"],
  subtypes: ["Orc", "Warrior"],
  power: 3,
  toughness: 3,
  text: "Mobilize 1 (Whenever this creature attacks, create a tapped and attacking 1/1 red Warrior creature token. Sacrifice it at the beginning of the next end step.)\nWhen this creature enters, target creature gets +1/+0 and gains indestructible until end of turn. (Damage and effects that say \"destroy\" don't destroy it.)",
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: {
        kind: "create-token",
        token: "Red Warrior Token",
        count: 1,
        tapped: true,
        attacking: "choose",
        sacrificeAtEndStep: true,
      },
      resolve: null,
      text: "Mobilize 1",
    },
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["creature"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "modify-pt", target: 0, power: 1, toughness: 0, duration: "end-of-turn" },
          {
            kind: "grant-keyword",
            target: 0,
            keyword: "indestructible",
            duration: "end-of-turn",
          },
        ],
      },
      resolve: null,
      text: "When this creature enters, target creature gets +1/+0 and gains indestructible until end of turn.",
    },
  ],
});
