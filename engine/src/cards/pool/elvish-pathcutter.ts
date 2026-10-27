import { defineCard } from "../define.js";

// Onslaught. EDHREC rank 27960. Unseen Walker's forestwalk grant, Elves only.

export default defineCard({
  name: "Elvish Pathcutter",
  manaCost: "{3}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Elf", "Scout"],
  power: 1,
  toughness: 2,
  text: "{2}{G}: Target Elf creature gains forestwalk until end of turn. (It can't be blocked as long as defending player controls a Forest.)",
  activated: [
    {
      cost: { mana: "{2}{G}", tap: false },
      targets: [{ kind: "permanent", filter: { type: "creature", subtype: "Elf" } }],
      effect: { kind: "grant-keyword", target: 0, keyword: "forestwalk", duration: "end-of-turn" },
      resolve: null,
      text: "{2}{G}: Target Elf creature gains forestwalk until end of turn.",
    },
  ],
});
