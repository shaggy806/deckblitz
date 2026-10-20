import { defineCard } from "../define.js";

// Rulings:
//   The bonus is determined only as Kabira Outrider's ability resolves; it won't change
//   later in the turn even if the number of creatures in your party changes.

const TEXT =
  "When this creature enters, target creature gets +1/+1 until end of turn for each creature in your party.";

export default defineCard({
  name: "Kabira Outrider",
  manaCost: "{3}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Warrior"],
  power: 3,
  toughness: 3,
  text: `${TEXT} (Your party consists of up to one each of Cleric, Rogue, Warrior, and Wizard.)`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["creature"],
      effect: {
        kind: "modify-pt",
        target: 0,
        power: { partySize: "you" },
        toughness: { partySize: "you" },
        duration: "end-of-turn",
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
