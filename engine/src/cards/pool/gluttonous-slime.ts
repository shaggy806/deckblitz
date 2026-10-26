import { defineCard } from "../define.js";

export default defineCard({
  name: "Gluttonous Slime",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Ooze"],
  power: 2,
  toughness: 2,
  keywords: ["flash"],
  devour: { multiplier: 1, filter: { type: "creature" } },
  text: "Flash\nDevour 1 (As this creature enters, you may sacrifice any number of creatures. It enters with that many +1/+1 counters on it.)",
});
