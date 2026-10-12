import { defineCard } from "../define.js";

export default defineCard({
  name: "Aethershield Artificer",
  manaCost: "{3}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Dwarf", "Artificer"],
  power: 3,
  toughness: 3,
  text: "At the beginning of combat on your turn, target artifact creature you control gets +2/+2 and gains indestructible until end of turn. (Damage and effects that say \"destroy\" don't destroy it.)",
  triggered: [
    {
      trigger: { on: "step-begins", step: "begin-combat", who: "you" },
      targets: [{ kind: "permanent", whose: "you", filter: { types: ["artifact", "creature"] } }],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "modify-pt", target: 0, power: 2, toughness: 2, duration: "end-of-turn" },
          {
            kind: "grant-keyword",
            target: 0,
            keyword: "indestructible",
            duration: "end-of-turn",
          },
        ],
      },
      resolve: null,
      text: "At the beginning of combat on your turn, target artifact creature you control gets +2/+2 and gains indestructible until end of turn.",
    },
  ],
});
