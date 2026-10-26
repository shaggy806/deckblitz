import { defineCard } from "../define.js";

// EDHREC rank 26687. Coldsnap.
//
// The animation has no duration (the ruling), and doesn't end if the land
// later stops being snow: the filter is only the target's.

export default defineCard({
  name: "Balduvian Frostwaker",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Human", "Wizard"],
  power: 1,
  toughness: 1,
  text: "{U}, {T}: Target snow land becomes a 2/2 blue Elemental creature with flying. It's still a land.",
  activated: [
    {
      cost: { mana: "{U}", tap: true },
      targets: [{ kind: "permanent", filter: { type: "land", supertype: "snow" } }],
      effect: {
        kind: "animate",
        target: 0,
        power: 2,
        toughness: 2,
        addTypes: ["creature"],
        addSubtypes: ["Elemental"],
        setColors: ["U"],
        keywords: ["flying"],
        duration: "permanent",
      },
      resolve: null,
      text: "{U}, {T}: Target snow land becomes a 2/2 blue Elemental creature with flying. It's still a land.",
    },
  ],
});
