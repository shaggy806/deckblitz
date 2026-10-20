import { defineCard } from "../define.js";

const TEXT =
  "{2}: Target snow land you control becomes a 4/4 Elemental creature with hexproof and haste until end of turn. It's still a land.";

export default defineCard({
  name: "Avalanche Caller",
  manaCost: "{1}{U}",
  colors: ["U"],
  supertypes: ["snow"],
  types: ["creature"],
  subtypes: ["Human", "Wizard"],
  power: 1,
  toughness: 3,
  text: `${TEXT} (A creature with hexproof can't be the target of spells or abilities your opponents control.)`,
  activated: [
    {
      cost: { mana: "{2}", tap: false },
      targets: [{ kind: "permanent", whose: "you", filter: { type: "land", supertype: "snow" } }],
      effect: {
        kind: "animate",
        target: 0,
        power: 4,
        toughness: 4,
        addTypes: ["creature"],
        addSubtypes: ["Elemental"],
        keywords: ["hexproof", "haste"],
        duration: "end-of-turn",
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
