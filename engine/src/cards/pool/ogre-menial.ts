import { defineCard } from "../define.js";

export default defineCard({
  name: "Ogre Menial",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Phyrexian", "Ogre"],
  power: 0,
  toughness: 4,
  keywords: ["infect"],
  text: "Infect (This creature deals damage to creatures in the form of -1/-1 counters and to players in the form of poison counters.)\n{R}: This creature gets +1/+0 until end of turn.",
  activated: [
    {
      cost: { mana: "{R}", tap: false },
      targets: [],
      effect: { kind: "modify-pt", target: "source", power: 1, toughness: 0, duration: "end-of-turn" },
      resolve: null,
      text: "{R}: This creature gets +1/+0 until end of turn.",
    },
  ],
});
