import { defineCard } from "../define.js";

const TEXT =
  "When this creature dies, target creature an opponent controls gets -1/-1 until end of turn. That creature gets -4/-4 instead if you control a creature named Bogbrew Witch.";

// Bogbrew Witch is checked only as the trigger resolves (the ruling).
export default defineCard({
  name: "Festering Newt",
  manaCost: "{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Salamander"],
  power: 1,
  toughness: 1,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "dies", who: "self" },
      targets: ["creature-an-opponent-controls"],
      effect: {
        kind: "conditional",
        condition: { kind: "controls", filter: { type: "creature", name: "Bogbrew Witch" }, atLeast: 1 },
        then: { kind: "modify-pt", target: 0, power: -4, toughness: -4, duration: "end-of-turn" },
        else: { kind: "modify-pt", target: 0, power: -1, toughness: -1, duration: "end-of-turn" },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
