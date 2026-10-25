import { defineCard } from "../define.js";

// Worldwake (WWK). EDHREC rank 25633.
//
// Destiny Spinner's shape: X is the Allies you control as the ability
// resolves, fixed from then on (the rulings) — 0 with none, and the land
// dies as a 0/0.
const TEXT =
  "{T}: Target land you control becomes an X/X Elemental creature until end of turn, where X is the number of Allies you control. It's still a land.";
const ALLIES = { countOf: { subtype: "Ally", controlledBy: "you" } } as const;

export default defineCard({
  name: "Vastwood Animist",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Elf", "Shaman", "Ally"],
  power: 1,
  toughness: 1,
  text: TEXT,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: ["land-you-control"],
      effect: {
        kind: "animate",
        target: 0,
        power: ALLIES,
        toughness: ALLIES,
        addTypes: ["creature"],
        addSubtypes: ["Elemental"],
        duration: "end-of-turn",
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
