import { defineCard } from "../define.js";

// Conspiracy: Take the Crown. Palace Jailer leaving changes nothing; any opponent
// becoming the monarch brings the creature back, not one who is already (the
// rulings). A token exiled ceases to exist (rule 111.7).

const MONARCH_TEXT = "When this creature enters, you become the monarch.";
const EXILE_TEXT = "When this creature enters, exile target creature an opponent controls until an opponent becomes the monarch.";

export default defineCard({
  name: "Palace Jailer",
  manaCost: "{2}{W}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Soldier"],
  power: 2,
  toughness: 2,
  text: `${MONARCH_TEXT}\n${EXILE_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "become-monarch" },
      resolve: null,
      text: MONARCH_TEXT,
    },
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["creature-an-opponent-controls"],
      effect: { kind: "exile", target: 0, until: "opponent-becomes-monarch" },
      resolve: null,
      text: EXILE_TEXT,
    },
  ],
});
