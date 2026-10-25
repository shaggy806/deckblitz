import { defineCard } from "../define.js";

// EDHREC rank 19288. Sarkhan, Soul Aflame's copy of the entering creature
// until end of turn, read as it last existed if it has left (the rulings);
// while a copy it has the copied creature's abilities and not this one.

const TEXT =
  "Whenever another creature you control enters, you may have this creature become a copy of that creature until end of turn. (If it does, it loses this ability for the rest of the turn.)";

export default defineCard({
  name: "Renegade Doppelganger",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Shapeshifter"],
  power: 0,
  toughness: 1,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "you-control", filter: { type: "creature" }, otherOnly: true },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Have Renegade Doppelganger become a copy of that creature until end of turn?",
        effect: { kind: "become-copy", target: "source", of: "trigger-object", until: "end-of-turn" },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
