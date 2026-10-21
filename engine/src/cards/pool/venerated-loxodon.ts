import { defineCard } from "../define.js";

const TEXT = "When this creature enters, put a +1/+1 counter on each creature that convoked it.";

export default defineCard({
  name: "Venerated Loxodon",
  manaCost: "{4}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Elephant", "Cleric"],
  power: 4,
  toughness: 4,
  convoke: true,
  text: `Convoke (Your creatures can help cast this spell. Each creature you tap while casting this spell pays for {1} or one mana of that creature's color.)\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "for-each-convoker", effect: { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 } },
      resolve: null,
      text: TEXT,
    },
  ],
});
