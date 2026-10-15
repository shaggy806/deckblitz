import { defineCard } from "../define.js";

const TEXT =
  "Morbid — When this creature enters, target creature an opponent controls gets -1/-1 until end of turn. If a creature died this turn, that creature gets -13/-13 until end of turn instead.";

export default defineCard({
  name: "Tragic Banshee",
  manaCost: "{4}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Spirit"],
  power: 5,
  toughness: 3,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["creature-an-opponent-controls"],
      // Morbid is read as the ability resolves; it isn't an intervening "if".
      effect: {
        kind: "conditional",
        condition: { kind: "creature-died-this-turn" },
        then: { kind: "modify-pt", target: 0, power: -13, toughness: -13, duration: "end-of-turn" },
        else: { kind: "modify-pt", target: 0, power: -1, toughness: -1, duration: "end-of-turn" },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
