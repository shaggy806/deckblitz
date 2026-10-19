import { defineCard } from "../define.js";

// Two different target players, both chosen as the ability is activated. The
// Robot's player is slot 0, where `create-token`'s "target-controller" reads
// it, and the drawing player slot 1 ("another target player"); with one of
// them illegal as it resolves, only the other's half happens (rule 608.2b —
// no Robot for anyone if the Robot's player is the illegal one).

const ABILITY_TEXT =
  "Field Reprogramming — {U}, {T}: Target player draws a card. Another target player creates a 4/4 colorless Robot artifact creature token with \"This token can't block.\"";

export default defineCard({
  name: "Cybernetica Datasmith",
  manaCost: "{1}{U}{B}",
  colors: ["U", "B"],
  types: ["artifact", "creature"],
  subtypes: ["Human", "Artificer"],
  power: 0,
  toughness: 1,
  text: `Protection from Robots\n${ABILITY_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      protection: { filter: { subtype: "Robot" } },
      text: "Protection from Robots",
    },
  ],
  activated: [
    {
      cost: { mana: "{U}", tap: true },
      targets: ["player", { kind: "other", of: "player", than: { slot: 0 } }],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "draw", amount: 1, target: 1 },
          { kind: "create-token", token: "Robot Token (Cybernetica Datasmith)", count: 1, who: "target-controller" },
        ],
      },
      resolve: null,
      text: ABILITY_TEXT,
    },
  ],
});
