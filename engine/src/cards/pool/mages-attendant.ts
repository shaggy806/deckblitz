import { defineCard } from "../define.js";

const ENTER_TEXT =
  'When this creature enters, create a 1/1 blue Wizard creature token with "{1}, Sacrifice this token: Counter target noncreature spell unless its controller pays {1}."';

export default defineCard({
  name: "Mage's Attendant",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Cat", "Rogue"],
  power: 3,
  toughness: 2,
  text: ENTER_TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Wizard Token (Mage's Attendant)", count: 1 },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
});
