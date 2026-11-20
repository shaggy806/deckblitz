import { defineCard } from "../define.js";
import { ward } from "../helpers.js";

// The 1/1 white Human with ward {2} of Fugitive of the Judoon.
const WARD_TEXT =
  "Ward {2} (Whenever this creature becomes the target of a spell or ability an opponent controls, counter it unless that player pays {2}.)";

export default defineCard({
  name: "Human Token (ward {2})",
  art: "65b58706-9140-4908-b613-702e607b7d8b",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human"],
  power: 1,
  toughness: 1,
  text: WARD_TEXT,
  triggered: [ward({ mana: "{2}" })],
});
