import { defineCard } from "../define.js";

// EDHREC rank 24828. Zendikar Rising. The bonus is fixed as the trigger
// resolves (the ruling).

const TEXT =
  "Whenever this creature attacks, it gets +1/+0 until end of turn for each creature in your party.";

export default defineCard({
  name: "Grotag Bug-Catcher",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Goblin", "Warrior"],
  power: 1,
  toughness: 2,
  keywords: ["trample"],
  text: `Trample\n${TEXT.slice(0, -1)}. (Your party consists of up to one each of Cleric, Rogue, Warrior, and Wizard.)`,
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: {
        kind: "modify-pt",
        target: "source",
        power: { partySize: "you" },
        toughness: 0,
        duration: "end-of-turn",
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
