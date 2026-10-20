import { defineCard } from "../define.js";

// EDHREC rank 21790. Zendikar Rising. The party is counted as the trigger
// resolves, the Electromancer itself included if it's still there (the
// ruling); it uses the stack, not a mana ability (the ruling).

const TEXT = "When this creature enters, add {R} for each creature in your party.";

export default defineCard({
  name: "Ardent Electromancer",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Human", "Wizard"],
  power: 3,
  toughness: 2,
  text: `${TEXT.slice(0, -1)}. (Your party consists of up to one each of Cleric, Rogue, Warrior, and Wizard.)`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "add-mana", mana: "R", amount: { partySize: "you" } },
      resolve: null,
      text: TEXT,
    },
  ],
});
