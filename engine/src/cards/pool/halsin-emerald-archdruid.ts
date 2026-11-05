import { defineCard } from "../define.js";

// EDHREC rank 13388.

const TEXT =
  "{1}: Until end of turn, target token you control becomes a green Bear creature with base power and toughness 4/4 in addition to its other colors and types.";

export default defineCard({
  name: "Halsin, Emerald Archdruid",
  manaCost: "{3}{G}",
  colors: ["G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Elf", "Druid"],
  power: 2,
  toughness: 4,
  pairing: { kind: "choose-a-background" },
  text: `${TEXT}\nChoose a Background (You can have a Background as a second commander.)`,
  activated: [
    {
      cost: { mana: "{1}", tap: false },
      targets: [{ kind: "permanent", whose: "you", filter: { token: true } }],
      effect: {
        kind: "animate",
        target: 0,
        power: 4,
        toughness: 4,
        addTypes: ["creature"],
        addSubtypes: ["Bear"],
        addColors: ["G"],
        duration: "end-of-turn",
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
