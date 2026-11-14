import { defineCard } from "../define.js";

// Opens an Attraction as it enters (rule 701.51): nothing without an
// Attraction deck (701.51a).

const OPEN = "When this creature enters, open an Attraction. (Put the top card of your Attraction deck onto the battlefield.)";

export default defineCard({
  name: "Petting Zookeeper",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Elf", "Employee"],
  power: 0,
  toughness: 4,
  keywords: ["reach"],
  text: `Reach\n${OPEN}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "open-attraction" },
      resolve: null,
      text: OPEN,
    },
  ],
});
