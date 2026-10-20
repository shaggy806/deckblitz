import { defineCard } from "../define.js";
import { ward } from "../helpers.js";

export default defineCard({
  name: "Chaplain of Alms",
  manaCost: "{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Cleric"],
  power: 1,
  toughness: 1,
  keywords: ["first-strike"],
  disturb: { cost: "{3}{W}" },
  text: "First strike\nWard {1} (Whenever this creature becomes the target of a spell or ability an opponent controls, counter it unless that player pays {1}.)\nDisturb {3}{W} (You may cast this card from your graveyard transformed for its disturb cost.)",
  triggered: [ward({ mana: "{1}" })],
  faces: ["Chaplain of Alms", "Chapel Shieldgeist"],
  transform: true,
});
