import { defineCard } from "../define.js";

// EDHREC rank 24920. Zendikar Rising. With no party as it resolves, there's
// no scry at all (scry 0 — rule 701.22b; the ruling).

const TEXT = "When this creature enters, scry X, where X is the number of creatures in your party.";

export default defineCard({
  name: "Cascade Seer",
  manaCost: "{3}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Merfolk", "Wizard"],
  power: 3,
  toughness: 3,
  text: `${TEXT.slice(0, -1)}. (Your party consists of up to one each of Cleric, Rogue, Warrior, and Wizard.)`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "scry", amount: { partySize: "you" } },
      resolve: null,
      text: TEXT,
    },
  ],
});
