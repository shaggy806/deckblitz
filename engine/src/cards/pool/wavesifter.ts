import { defineCard } from "../define.js";

const ENTERS_TEXT =
  "When this creature enters, investigate twice. (To investigate, create a Clue token. It's an artifact with \"{2}, Sacrifice this token: Draw a card.\")";

export default defineCard({
  name: "Wavesifter",
  manaCost: "{3}{G}{U}",
  colors: ["U", "G"],
  types: ["creature"],
  subtypes: ["Elemental"],
  power: 3,
  toughness: 2,
  keywords: ["flying"],
  evoke: { cost: "{G}{U}" },
  text: `Flying\n${ENTERS_TEXT}\nEvoke {G}{U} (You may cast this spell for its evoke cost. If you do, it's sacrificed when it enters.)`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Clue Token", count: 2 },
      resolve: null,
      text: ENTERS_TEXT,
    },
  ],
});
