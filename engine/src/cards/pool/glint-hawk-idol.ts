import { defineCard } from "../define.js";

// EDHREC rank 29937. Both abilities make it a Bird (the errata ruling); it
// stays colourless. Each resets its base P/T to 2/2 (layer 7b), so other
// modifiers still apply on top.
//
// Rulings:
//   [2011-01-01] If Glint Hawk Idol and another artifact enter under your control at the same
//     time, Glint Hawk Idol's first ability will trigger. You may have it become a creature, but
//     since it will be affected by "summoning sickness," it won't be able to attack that turn.

const TRIGGER_TEXT =
  "Whenever another artifact you control enters, you may have this artifact become a 2/2 Bird artifact creature with flying until end of turn.";
const ACTIVATED_TEXT = "{W}: This artifact becomes a 2/2 Bird artifact creature with flying until end of turn.";

export default defineCard({
  name: "Glint Hawk Idol",
  manaCost: "{2}",
  colors: [],
  types: ["artifact"],
  text: `${TRIGGER_TEXT}\n${ACTIVATED_TEXT}`,
  activated: [
    {
      cost: { mana: "{W}", tap: false },
      targets: [],
      effect: {
        kind: "animate",
        target: "source",
        power: 2,
        toughness: 2,
        addTypes: ["artifact", "creature"],
        addSubtypes: ["Bird"],
        keywords: ["flying"],
        duration: "end-of-turn",
      },
      resolve: null,
      text: ACTIVATED_TEXT,
    },
  ],
  triggered: [
    {
      trigger: {
        on: "enters-battlefield",
        who: "you-control",
        filter: { type: "artifact" },
        otherOnly: true,
      },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Have Glint Hawk Idol become a 2/2 Bird artifact creature with flying until end of turn?",
        effect: {
          kind: "animate",
          target: "source",
          power: 2,
          toughness: 2,
          addTypes: ["artifact", "creature"],
          addSubtypes: ["Bird"],
          keywords: ["flying"],
          duration: "end-of-turn",
        },
      },
      resolve: null,
      text: TRIGGER_TEXT,
    },
  ],
});
