import { defineCard } from "../define.js";

const TEXT = "{0}: Attach target Equipment you control to this creature. Activate only as a sorcery.";

export default defineCard({
  name: "Kazuul's Toll Collector",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Ogre", "Warrior"],
  power: 3,
  toughness: 2,
  text: TEXT,
  activated: [
    {
      cost: { mana: "{0}", tap: false },
      targets: [{ kind: "permanent", whose: "you", filter: { subtype: "Equipment" } }],
      effect: { kind: "attach", target: "source", attachment: 0 },
      resolve: null,
      text: TEXT,
      sorcerySpeed: true,
    },
  ],
});
