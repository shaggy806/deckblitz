import { defineCard } from "../define.js";

const DISGUISE_TEXT =
  "Disguise {5}{G}{G} (You may cast this card face down for {3} as a 2/2 creature with ward {2}. Turn it face up any time for its disguise cost.)";
const FACE_UP_TEXT =
  "When this creature is turned face up, put a +1/+1 counter on each creature you control. Creatures you control gain trample until end of turn.";

const YOURS = { type: "creature", controlledBy: "you" } as const;

export default defineCard({
  name: "Greenbelt Radical",
  manaCost: "{3}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Centaur", "Citizen"],
  power: 4,
  toughness: 4,
  text: `${DISGUISE_TEXT}\n${FACE_UP_TEXT}`,
  morph: { keyword: "disguise", cost: "{5}{G}{G}" },
  triggered: [
    {
      trigger: { on: "turned-face-up", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "add-counter-all", filter: YOURS, counter: "+1/+1", amount: 1 },
          { kind: "grant-keyword-all", filter: YOURS, keyword: "trample", duration: "end-of-turn" },
        ],
      },
      resolve: null,
      text: FACE_UP_TEXT,
    },
  ],
});
