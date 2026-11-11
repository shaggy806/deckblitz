import { defineCard } from "../define.js";

const ATTACK_TEXT =
  'Whenever you attack, you create a Food token for each player being attacked. (It\'s an artifact with "{2}, {T}, Sacrifice this token: You gain 3 life.")';
const HUMANS_TEXT = "{W}, {T}, Tap X untapped Foods you control: Create X 1/1 white Human creature tokens.";

export default defineCard({
  name: "Apothecary White",
  manaCost: "{3}{W}",
  colors: ["W"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Cleric"],
  power: 3,
  toughness: 4,
  keywords: ["vigilance"],
  text: `Vigilance\n${ATTACK_TEXT}\n${HUMANS_TEXT}`,
  triggered: [
    {
      trigger: { on: "attack-with", who: "you", atLeast: 1 },
      targets: [],
      effect: { kind: "create-token", token: "Food Token", count: { opponentsAttacked: true } },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
  activated: [
    {
      cost: {
        mana: "{W}",
        tap: true,
        tapOthers: { count: "x", filter: { subtype: "Food", controlledBy: "you" } },
      },
      targets: [],
      effect: { kind: "create-token", token: "Human Token", count: "x" },
      resolve: null,
      text: HUMANS_TEXT,
    },
  ],
});
