import { defineCard } from "../define.js";
import { equip } from "../helpers.js";

// EDHREC rank 18243. Dwarven Shortsword's enters shape.

const ENTER_TEXT =
  "When this Equipment enters, create a 2/2 colorless Robot artifact creature token and attach this Equipment to it.";
const EQUIPPED_TEXT = "Equipped creature gets +1/+2 and has flying.";

export default defineCard({
  name: "Auxiliary Boosters",
  manaCost: "{4}{W}",
  colors: ["W"],
  types: ["artifact"],
  subtypes: ["Equipment"],
  text: `${ENTER_TEXT}\n${EQUIPPED_TEXT}\nEquip {3} ({3}: Attach to target creature you control. Equip only as a sorcery.)`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "create-token", token: "Robot Token", count: 1 },
          { kind: "attach", target: "created", attachment: "source" },
        ],
      },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
  static: [{ affects: { scope: "attached" }, grantPt: [1, 2], grantKeywords: ["flying"], text: EQUIPPED_TEXT }],
  activated: [equip("{3}")],
});
