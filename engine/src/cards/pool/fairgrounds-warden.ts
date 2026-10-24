import { defineCard } from "../define.js";

const ETB_TEXT =
  "When this creature enters, exile target creature an opponent controls until this creature leaves the battlefield.";

export default defineCard({
  name: "Fairgrounds Warden",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Dwarf", "Soldier"],
  power: 1,
  toughness: 3,
  text: ETB_TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["creature-an-opponent-controls"],
      effect: { kind: "exile", target: 0, untilSourceLeaves: true },
      resolve: null,
      text: ETB_TEXT,
    },
  ],
});
