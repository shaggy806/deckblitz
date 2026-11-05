import { defineCard } from "../define.js";

const ENTER_TEXT =
  "When this creature enters, target opponent reveals a number of cards from their hand equal to the number of creatures in your party. You choose one of those cards. That player discards that card. (Your party consists of up to one each of Cleric, Rogue, Warrior, and Wizard.)";

export default defineCard({
  name: "Acquisitions Expert",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Human", "Rogue"],
  power: 1,
  toughness: 2,
  text: ENTER_TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["opponent"],
      effect: { kind: "discard-chosen", target: 0, reveals: { partySize: "you" } },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
});
