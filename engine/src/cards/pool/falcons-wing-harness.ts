import { defineCard } from "../define.js";
import { ward } from "../helpers.js";

// EDHREC rank 17200.

const ENTER_TEXT = "When this Equipment enters, attach it to target creature you control.";
const STATIC_TEXT = "Equipped creature gets +1/+1 and has flying and ward {1}.";

export default defineCard({
  name: "Falcon's Wing Harness",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["artifact"],
  subtypes: ["Equipment"],
  text:
    `${ENTER_TEXT}\n${STATIC_TEXT} (Whenever equipped creature becomes the target of a spell or ability an opponent controls, counter it unless that player pays {1}.)\n` +
    "Equip {2}{U} ({2}{U}: Attach to target creature you control. Equip only as a sorcery.)",
  activated: [
    {
      cost: { mana: "{2}{U}", tap: false },
      targets: ["creature-you-control"],
      effect: { kind: "attach", target: 0 },
      resolve: null,
      text: "Equip {2}{U}",
      sorcerySpeed: true,
    },
  ],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["creature-you-control"],
      effect: { kind: "attach", target: 0, attachment: "source" },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
  static: [
    {
      affects: { scope: "attached" },
      grantPt: [1, 1],
      grantKeywords: ["flying"],
      grantsTriggered: [ward({ mana: "{1}" })],
      text: STATIC_TEXT,
    },
  ],
});
