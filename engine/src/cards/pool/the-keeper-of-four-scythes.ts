import { defineCard } from "../define.js";

// Playtest card (Unknown Event). The Scythes are Blacksmith's Talent's Sword
// under another name: "Equipped creature gets +1/+1" and equip {2}.
const ECHO_TEXT =
  "Echo {3}{W}{W} (At the beginning of your upkeep, if this came under your control since the beginning of your last upkeep, sacrifice it unless you pay its echo cost.)";
const ETB_TEXT =
  "When The Keeper of Four Scythes enters, create four Scythe tokens. (They're Equipment with \"Equipped creature gets +1/+1\" and equip {2}.)";
const STATIC_TEXT = "Equipped creatures you control get +1/+1.";

export default defineCard({
  name: "The Keeper of Four Scythes",
  manaCost: "{3}{W}{W}",
  colors: ["W"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Wizard"],
  power: 1,
  toughness: 1,
  text: `${ECHO_TEXT}\n${ETB_TEXT}\n${STATIC_TEXT}`,
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      condition: { kind: "source-came-under-control-since-last-upkeep" },
      targets: [],
      effect: {
        kind: "unless",
        chooser: "you",
        options: [{ pay: "{3}{W}{W}", text: "Pay {3}{W}{W}" }],
        otherwise: { kind: "sacrifice-source" },
      },
      resolve: null,
      text: ECHO_TEXT,
    },
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Scythe Token", count: 4 },
      resolve: null,
      text: ETB_TEXT,
    },
  ],
  static: [
    {
      affects: { scope: "filter", filter: { type: "creature", controlledBy: "you", equipped: true } },
      grantPt: [1, 1],
      text: STATIC_TEXT,
    },
  ],
});
