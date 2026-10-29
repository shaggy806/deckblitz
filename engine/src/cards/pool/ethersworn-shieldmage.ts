import { defineCard } from "../define.js";

// Ruling: nothing is locked in — any damage that would be dealt this turn to a
// permanent that's an artifact creature at that time is prevented (615.1).

export default defineCard({
  name: "Ethersworn Shieldmage",
  manaCost: "{1}{W}{U}",
  colors: ["W", "U"],
  types: ["artifact", "creature"],
  subtypes: ["Vedalken", "Wizard"],
  power: 2,
  toughness: 2,
  keywords: ["flash"],
  text: "Flash\nWhen this creature enters, prevent all damage that would be dealt to artifact creatures this turn.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "damage-rule", to: { permanents: { types: ["artifact", "creature"] } } },
      resolve: null,
      text: "When this creature enters, prevent all damage that would be dealt to artifact creatures this turn.",
    },
  ],
});
