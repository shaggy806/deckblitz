import { defineCard } from "../define.js";

// EDHREC rank 20884.
// Sarkhan, Soul Aflame's `become-copy` until end of turn, with only the name
// kept: he has the copied permanent's abilities (and not his own) until the
// cleanup step.

const TEXT =
  "{2}{U}: Impossible Man becomes a copy of another target permanent until end of turn, except his name is Impossible Man.";

export default defineCard({
  name: "Impossible Man",
  manaCost: "{2}{U}",
  colors: ["U"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Alien", "Shapeshifter"],
  power: 1,
  toughness: 4,
  keywords: ["flying"],
  text: `Flying\n${TEXT}`,
  activated: [
    {
      cost: { mana: "{2}{U}", tap: false },
      targets: [{ kind: "other", of: "permanent" }],
      effect: {
        kind: "become-copy",
        target: "source",
        of: 0,
        until: "end-of-turn",
        exceptions: { name: "Impossible Man" },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
