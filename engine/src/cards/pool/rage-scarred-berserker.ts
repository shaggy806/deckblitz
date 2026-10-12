import { defineCard } from "../define.js";

export default defineCard({
  name: "Rage-Scarred Berserker",
  manaCost: "{4}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Minotaur", "Berserker"],
  power: 5,
  toughness: 4,
  text: "When this creature enters, target creature you control gets +1/+0 and gains indestructible until end of turn. (Damage and effects that say \"destroy\" don't destroy it.)",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["creature-you-control"],
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
      text: "When this creature enters, target creature you control gets +1/+0 and gains indestructible until end of turn.",
    },
  ],
});
