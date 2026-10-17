import { defineCard } from "../define.js";

const ATTACK_TEXT =
  "Whenever Éomer attacks, if you control a creature with the greatest power among creatures on the battlefield, create a 1/1 white Human Soldier creature token.";

export default defineCard({
  name: "Éomer of the Riddermark",
  manaCost: "{4}{R}",
  colors: ["R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Knight"],
  power: 5,
  toughness: 4,
  keywords: ["haste"],
  text: `Haste\n${ATTACK_TEXT}`,
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      // An intervening "if" (rule 603.4), asked again as it resolves. Tied for
      // the greatest still has the greatest (High Score's reading).
      condition: { kind: "controls-greatest", of: "power", filter: { type: "creature" } },
      targets: [],
      effect: { kind: "create-token", token: "Human Soldier Token", count: 1 },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
});
