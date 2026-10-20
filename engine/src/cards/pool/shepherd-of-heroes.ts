import { defineCard } from "../define.js";

// Rulings:
//   If an ability of a creature counts the number of creatures in your party, that number
//   is counted as the ability resolves. If that creature is still on the battlefield, it'll
//   be counted if appropriate.

const TEXT = "When this creature enters, you gain 2 life for each creature in your party.";

export default defineCard({
  name: "Shepherd of Heroes",
  manaCost: "{4}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Angel", "Cleric"],
  power: 3,
  toughness: 4,
  keywords: ["flying"],
  text: `Flying\n${TEXT} (Your party consists of up to one each of Cleric, Rogue, Warrior, and Wizard.)`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "gain-life", amount: { product: [2, { partySize: "you" }] } },
      resolve: null,
      text: TEXT,
    },
  ],
});
