import { defineCard } from "../define.js";

// EDHREC rank 16055. Every Zombie token you control, not only the Army (the
// ruling).

export default defineCard({
  name: "Dreadhorde Twins",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Zombie", "Jackal", "Warrior"],
  power: 2,
  toughness: 2,
  text: "When this creature enters, amass Zombies 2. (Put two +1/+1 counters on an Army you control. It's also a Zombie. If you don't control an Army, create a 0/0 black Zombie Army creature token first.)\nZombie tokens you control have trample.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "amass", amount: 2, creatureType: "Zombie" },
      resolve: null,
      text: "When this creature enters, amass Zombies 2.",
    },
  ],
  static: [
    {
      affects: { scope: "creatures-you-control", subtype: "Zombie", tokenOnly: true },
      grantKeywords: ["trample"],
      text: "Zombie tokens you control have trample.",
    },
  ],
});
