import { defineCard } from "../define.js";

// The Construct's size is fixed as the ability resolves, before the token
// exists, so it doesn't count itself (the rulings); it prints 0/0 and takes
// `basePt` as it's made.

const SERVO_TEXT = "{2}{G}, {T}: Create a 1/1 colorless Servo artifact creature token.";
const CONSTRUCT_TEXT =
  "{4}{G}, {T}: Create an X/X colorless Construct artifact creature token, where X is the number of creatures you control.";

export default defineCard({
  name: "Oviya Pashiri, Sage Lifecrafter",
  manaCost: "{G}",
  colors: ["G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Artificer"],
  power: 1,
  toughness: 2,
  text: `${SERVO_TEXT}\n${CONSTRUCT_TEXT}`,
  activated: [
    {
      cost: { mana: "{2}{G}", tap: true },
      targets: [],
      effect: { kind: "create-token", token: "Servo Token", count: 1 },
      resolve: null,
      text: SERVO_TEXT,
    },
    {
      cost: { mana: "{4}{G}", tap: true },
      targets: [],
      effect: {
        kind: "create-token",
        token: "Construct Token (Metallurgic Summonings)",
        count: 1,
        basePt: {
          power: { countOf: { type: "creature", controlledBy: "you" } },
          toughness: { countOf: { type: "creature", controlledBy: "you" } },
        },
      },
      resolve: null,
      text: CONSTRUCT_TEXT,
    },
  ],
});
