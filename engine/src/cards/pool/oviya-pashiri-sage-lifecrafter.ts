import { defineCard } from "../define.js";

// Kaladesh. X is read once, as the ability resolves and before the Construct
// exists, so the token doesn't count itself (the rulings).
const CREATURES_YOU_CONTROL = { countOf: { type: "creature", controlledBy: "you" } } as const;

export default defineCard({
  name: "Oviya Pashiri, Sage Lifecrafter",
  manaCost: "{G}",
  colors: ["G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Artificer"],
  power: 1,
  toughness: 2,
  text: "{2}{G}, {T}: Create a 1/1 colorless Servo artifact creature token.\n{4}{G}, {T}: Create an X/X colorless Construct artifact creature token, where X is the number of creatures you control.",
  activated: [
    {
      cost: { mana: "{2}{G}", tap: true },
      targets: [],
      effect: { kind: "create-token", token: "Servo Token", count: 1 },
      resolve: null,
      text: "{2}{G}, {T}: Create a 1/1 colorless Servo artifact creature token.",
    },
    {
      cost: { mana: "{4}{G}", tap: true },
      targets: [],
      effect: {
        kind: "create-token",
        token: "Construct Token (Metallurgic Summonings)",
        count: 1,
        basePt: { power: CREATURES_YOU_CONTROL, toughness: CREATURES_YOU_CONTROL },
      },
      resolve: null,
      text: "{4}{G}, {T}: Create an X/X colorless Construct artifact creature token, where X is the number of creatures you control.",
    },
  ],
});
