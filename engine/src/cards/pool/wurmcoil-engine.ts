import { defineCard } from "../define.js";

// "Create a … and a …" is one instruction: the two tokens enter together
// (`simultaneous`), so a "whenever one or more tokens enter" trigger fires once.
const DIES_TEXT =
  "When this creature dies, create a 3/3 colorless Phyrexian Wurm artifact creature token with deathtouch and a 3/3 colorless Phyrexian Wurm artifact creature token with lifelink.";

export default defineCard({
  name: "Wurmcoil Engine",
  manaCost: "{6}",
  types: ["artifact", "creature"],
  subtypes: ["Phyrexian", "Wurm"],
  power: 6,
  toughness: 6,
  keywords: ["deathtouch", "lifelink"],
  text: `Deathtouch, lifelink\n${DIES_TEXT}`,
  triggered: [
    {
      trigger: { on: "dies", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        simultaneous: true,
        effects: [
          { kind: "create-token", token: "Phyrexian Wurm Token (Deathtouch)", count: 1 },
          { kind: "create-token", token: "Phyrexian Wurm Token (Lifelink)", count: 1 },
        ],
      },
      resolve: null,
      text: DIES_TEXT,
    },
  ],
});
