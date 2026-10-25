import { defineCard } from "../define.js";

const SURGE_TEXT =
  "Surge {1}{R} (You may cast this spell for its surge cost if you or a teammate has cast another spell this turn.)";
const ENTER_TEXT =
  "When this creature enters, if its surge cost was paid, other creatures you control get +1/+0 and gain haste until end of turn.";

const YOUR_CREATURES = { type: "creature", controlledBy: "you" } as const;

export default defineCard({
  name: "Reckless Bushwhacker",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Goblin", "Warrior", "Ally"],
  power: 2,
  toughness: 1,
  keywords: ["haste"],
  alternativeCost: {
    mana: "{1}{R}",
    keyword: "surge",
    condition: { kind: "cast-this-turn", who: "you", atLeast: 1 },
  },
  text: `${SURGE_TEXT}\nHaste\n${ENTER_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          {
            kind: "modify-pt-all",
            filter: YOUR_CREATURES,
            power: 1,
            toughness: 0,
            duration: "end-of-turn",
            exceptSource: true,
          },
          {
            kind: "grant-keyword-all",
            filter: YOUR_CREATURES,
            keyword: "haste",
            duration: "end-of-turn",
            exceptSource: true,
          },
        ],
      },
      resolve: null,
      text: ENTER_TEXT,
      condition: { kind: "self-surge-paid" },
    },
  ],
});
