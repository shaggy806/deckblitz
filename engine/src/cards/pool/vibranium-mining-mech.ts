import { defineCard } from "../define.js";
import { crew, crewText } from "../helpers.js";

// EDHREC rank 13240. Marvel Super Heroes Commander.
const MAKE_TEXT =
  "Whenever this Vehicle enters or attacks, create a tapped Vibranium token. (It's an artifact with indestructible and \"{T}: Add {C}. This mana can't be spent to cast a nonartifact spell.\")";
const PUMP_TEXT = "{2}: This Vehicle gets +1/+0 until end of turn.";
const make = { kind: "create-token", token: "Vibranium Token", count: 1, tapped: true } as const;

export default defineCard({
  name: "Vibranium Mining Mech",
  manaCost: "{4}",
  colors: [],
  types: ["artifact"],
  subtypes: ["Vehicle"],
  power: 6,
  toughness: 6,
  keywords: ["trample"],
  text: `Trample\n${MAKE_TEXT}\n${PUMP_TEXT}\n${crewText(2)}`,
  triggered: [
    { trigger: { on: "enters-battlefield", who: "self" }, targets: [], effect: make, resolve: null, text: MAKE_TEXT },
    { trigger: { on: "attacks", who: "self" }, targets: [], effect: make, resolve: null, text: MAKE_TEXT },
  ],
  activated: [
    {
      cost: { mana: "{2}", tap: false },
      targets: [],
      effect: { kind: "modify-pt", target: "source", power: 1, toughness: 0, duration: "end-of-turn" },
      resolve: null,
      text: PUMP_TEXT,
    },
    crew(2),
  ],
});
