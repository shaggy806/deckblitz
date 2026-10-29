import { defineCard } from "../define.js";

// Rulings: it prevents damage to the other attacking Soldiers whether or not
// it's attacking itself, and only while it's on the battlefield.

export default defineCard({
  name: "Rescue Retriever",
  manaCost: "{3}{W}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Dog", "Soldier"],
  power: 3,
  toughness: 3,
  keywords: ["flash"],
  text: "Flash\nWhen this creature enters, put a +1/+1 counter on each other Soldier you control.\nPrevent all damage that would be dealt to other attacking Soldiers you control.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "add-counter-all",
        filter: { subtypes: ["Soldier"], controlledBy: "you" },
        counter: "+1/+1",
        amount: 1,
        exceptSource: true,
      },
      resolve: null,
      text: "When this creature enters, put a +1/+1 counter on each other Soldier you control.",
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      replacement: {
        event: "would-deal-damage",
        prevent: true,
        toFilter: { subtypes: ["Soldier"], attacking: true, controlledBy: "you" },
        toOther: true,
      },
      text: "Prevent all damage that would be dealt to other attacking Soldiers you control.",
    },
  ],
});
