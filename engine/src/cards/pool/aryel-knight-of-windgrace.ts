import { defineCard } from "../define.js";

const KNIGHT_TEXT = "{2}{W}, {T}: Create a 2/2 white Knight creature token with vigilance.";
const DESTROY_TEXT = "{B}, {T}, Tap X untapped Knights you control: Destroy target creature with power X or less.";

// X is announced first (rule 601.2b), and the target is chosen by it, so the
// ability is offered once per X.
export default defineCard({
  name: "Aryel, Knight of Windgrace",
  manaCost: "{2}{W}{B}",
  colors: ["W", "B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Knight"],
  power: 4,
  toughness: 4,
  keywords: ["vigilance"],
  text: `Vigilance\n${KNIGHT_TEXT}\n${DESTROY_TEXT}`,
  activated: [
    {
      cost: { mana: "{2}{W}", tap: true },
      targets: [],
      effect: { kind: "create-token", token: "Knight Token", count: 1 },
      resolve: null,
      text: KNIGHT_TEXT,
    },
    {
      cost: { mana: "{B}", tap: true, tapOthers: { count: "x", filter: { subtype: "Knight", controlledBy: "you" } } },
      targets: [{ kind: "permanent", filter: { type: "creature", power: { op: "lte", n: "x" } } }],
      effect: { kind: "destroy", target: 0 },
      resolve: null,
      text: DESTROY_TEXT,
    },
  ],
});
