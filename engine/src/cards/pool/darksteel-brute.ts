import { defineCard } from "../define.js";

// Darksteel. EDHREC rank 24726. Firdoch Core's self-animation, as a Beast.

export default defineCard({
  name: "Darksteel Brute",
  manaCost: "{2}",
  colors: [],
  types: ["artifact"],
  keywords: ["indestructible"],
  text: "Indestructible (Damage and effects that say \"destroy\" don't destroy this artifact.)\n{3}: This artifact becomes a 2/2 Beast artifact creature until end of turn.",
  activated: [
    {
      cost: { mana: "{3}", tap: false },
      targets: [],
      effect: {
        kind: "animate",
        target: "source",
        power: 2,
        toughness: 2,
        addTypes: ["artifact", "creature"],
        addSubtypes: ["Beast"],
        duration: "end-of-turn",
      },
      resolve: null,
      text: "{3}: This artifact becomes a 2/2 Beast artifact creature until end of turn.",
    },
  ],
});
