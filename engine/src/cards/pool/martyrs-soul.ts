import { defineCard } from "../define.js";

const TEXT = "When this creature enters, if you control no tapped lands, put two +1/+1 counters on it.";

export default defineCard({
  name: "Martyr's Soul",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Spirit", "Soldier"],
  power: 3,
  toughness: 2,
  convoke: true,
  text: `Convoke (Your creatures can help cast this spell. Each creature you tap while casting this spell pays for {1} or one mana of that creature's color.)\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      condition: { kind: "not", of: { kind: "controls", filter: { type: "land", tapped: true }, atLeast: 1 } },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 2 },
      resolve: null,
      text: TEXT,
    },
  ],
});
