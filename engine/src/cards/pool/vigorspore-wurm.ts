import { defineCard } from "../define.js";

const ETB_TEXT =
  "Undergrowth — When this creature enters, target creature gains vigilance and gets +X/+X until end of turn, where X is the number of creature cards in your graveyard.";
const BLOCK_TEXT = "This creature can't be blocked by more than one creature.";

const X = { countInGraveyard: { type: "creature", ownedBy: "you" } } as const;

// X is read once, as the ability resolves (the ruling).
export default defineCard({
  name: "Vigorspore Wurm",
  manaCost: "{5}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Wurm"],
  power: 6,
  toughness: 4,
  text: `${ETB_TEXT}\n${BLOCK_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["creature"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "grant-keyword", target: 0, keyword: "vigilance", duration: "end-of-turn" },
          { kind: "modify-pt", target: 0, power: X, toughness: X, duration: "end-of-turn" },
        ],
      },
      resolve: null,
      text: ETB_TEXT,
    },
  ],
  static: [{ affects: { scope: "self" }, blockedByAtMostOne: true, text: BLOCK_TEXT }],
});
