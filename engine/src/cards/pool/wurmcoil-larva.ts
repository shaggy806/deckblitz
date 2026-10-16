import { defineCard } from "../define.js";

// EDHREC rank 12713.
// Makes two Phyrexian Wurms → "Phyrexian Wurm Token (Wurmcoil Larva, Deathtouch)" and
// "Phyrexian Wurm Token (Wurmcoil Larva, Lifelink)".
//
// "Create a … and a …" is one instruction: the two tokens enter together
// (`simultaneous`), so a "whenever one or more tokens enter" trigger fires once.
const DIES_TEXT =
  "When this creature dies, create a 1/2 black Phyrexian Wurm artifact creature token with deathtouch and a 2/1 black Phyrexian Wurm artifact creature token with lifelink.";

export default defineCard({
  name: "Wurmcoil Larva",
  manaCost: "{3}{B}{B}",
  colors: ["B"],
  types: ["artifact", "creature"],
  subtypes: ["Phyrexian", "Wurm"],
  power: 3,
  toughness: 3,
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
          { kind: "create-token", token: "Phyrexian Wurm Token (Wurmcoil Larva, Deathtouch)", count: 1 },
          { kind: "create-token", token: "Phyrexian Wurm Token (Wurmcoil Larva, Lifelink)", count: 1 },
        ],
      },
      resolve: null,
      text: DIES_TEXT,
    },
  ],
});
