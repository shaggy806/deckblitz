import { defineCard } from "../define.js";
import { equip } from "../helpers.js";

// EDHREC rank 11933. The token is Dark Leo & Shredder's 1/1 black Ninja. "It"
// is the equipped creature that dealt the damage; the cards drawn are its power
// as it last existed on the battlefield (the ruling).

const ENTER_TEXT = "When this Equipment enters, create a 1/1 black Ninja creature token, then attach this Equipment to it.";
const FLY_TEXT = "Equipped creature has flying.";
const HIT_TEXT =
  "Whenever equipped creature deals combat damage to a player, you may sacrifice it. If you do, draw cards equal to its power.";

export default defineCard({
  name: "Foot Chopper",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["artifact"],
  subtypes: ["Equipment"],
  text: `${ENTER_TEXT}\n${FLY_TEXT}\n${HIT_TEXT}\nEquip {2}`,
  activated: [equip("{2}")],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "create-token", token: "Ninja Token (Dark Leo & Shredder)", count: 1 },
          { kind: "attach", target: "created", attachment: "source" },
        ],
      },
      resolve: null,
      text: ENTER_TEXT,
    },
    {
      trigger: { on: "deals-combat-damage-to-player", who: "attached" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Sacrifice the equipped creature to draw cards equal to its power?",
        effect: {
          kind: "sequence",
          effects: [
            { kind: "sacrifice-target", target: "trigger-object" },
            {
              kind: "conditional",
              condition: { kind: "this-way", what: "sacrificed", atLeast: 1 },
              then: { kind: "draw", amount: { powerOf: "trigger-object" } },
            },
          ],
        },
      },
      resolve: null,
      text: HIT_TEXT,
    },
  ],
  static: [{ affects: { scope: "attached" }, grantKeywords: ["flying"], text: FLY_TEXT }],
});
