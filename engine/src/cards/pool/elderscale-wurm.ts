import { defineCard } from "../define.js";

// Magic 2013. See Ali from Cairo: at 7 life or more, damage takes you no lower
// than 7; below that, it drops as normal (the ruling).
const ENTER_TEXT = "When this creature enters, if your life total is less than 7, your life total becomes 7.";
const FLOOR_TEXT = "As long as you have 7 or more life, damage that would reduce your life total to less than 7 reduces it to 7 instead.";

export default defineCard({
  name: "Elderscale Wurm",
  manaCost: "{4}{G}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Wurm"],
  power: 7,
  toughness: 7,
  keywords: ["trample"],
  text: `Trample\n${ENTER_TEXT}\n${FLOOR_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      condition: { kind: "life-total", atMost: 6 },
      targets: [],
      effect: { kind: "set-life-total", who: "you", amount: 7 },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "life-total", atLeast: 7 },
      damageLifeFloor: 7,
      text: FLOOR_TEXT,
    },
  ],
});
