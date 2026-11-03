import { defineCard } from "../define.js";

// Blink's. Not being a creature takes its creature types with it (rule 205.1a,
// Weeping Angel's ruling), leaving an artifact, removed from combat (506.4).
const TEXT = "Whenever an opponent casts a creature spell, this token isn't a creature until end of turn.";

export default defineCard({
  name: "Alien Angel Token",
  art: "b65e872a-ba16-4df2-9214-60019fd6456a",
  colors: ["B"],
  types: ["artifact", "creature"],
  subtypes: ["Alien", "Angel"],
  power: 2,
  toughness: 2,
  keywords: ["first-strike", "vigilance"],
  text: `First strike, vigilance\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "cast-spell", who: "opponent", filter: { type: "creature" } },
      targets: [],
      effect: { kind: "add-types", target: "source", removeTypes: ["creature"], duration: "end-of-turn" },
      resolve: null,
      text: TEXT,
    },
  ],
});
