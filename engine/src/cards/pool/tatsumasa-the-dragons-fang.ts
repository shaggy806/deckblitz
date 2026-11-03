import { defineCard } from "../define.js";
import { equip } from "../helpers.js";

const PUMP = "Equipped creature gets +5/+5.";
const RETURN_TEXT = "Return Tatsumasa to the battlefield under its owner's control when that token dies.";
const ACTIVATED = `{6}, Exile Tatsumasa: Create a 5/5 blue Dragon Spirit creature token with flying. ${RETURN_TEXT}`;

export default defineCard({
  name: "Tatsumasa, the Dragon's Fang",
  manaCost: "{6}",
  supertypes: ["legendary"],
  types: ["artifact"],
  subtypes: ["Equipment"],
  text: `${PUMP}\n${ACTIVATED}\nEquip {3}`,
  static: [{ affects: { scope: "attached" }, grantPt: [5, 5], text: PUMP }],
  activated: [
    {
      cost: { mana: "{6}", tap: false, exileSelf: true },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "create-token", token: "Dragon Spirit Token (Tatsumasa)", count: 1 },
          {
            kind: "delayed-trigger",
            at: { leaves: "created", to: ["graveyard"] },
            effect: { kind: "put-onto-battlefield", target: "source" },
            text: RETURN_TEXT,
          },
        ],
      },
      resolve: null,
      text: ACTIVATED,
    },
    equip("{3}"),
  ],
});
