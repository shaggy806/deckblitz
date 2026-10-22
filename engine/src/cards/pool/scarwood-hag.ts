import { defineCard } from "../define.js";

export default defineCard({
  name: "Scarwood Hag",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Hag"],
  power: 1,
  toughness: 1,
  text: "{G}{G}{G}{G}, {T}: Target creature gains forestwalk until end of turn. (It can't be blocked as long as defending player controls a Forest.)\n{T}: Target creature loses forestwalk until end of turn.",
  activated: [
    {
      cost: { mana: "{G}{G}{G}{G}", tap: true },
      targets: ["creature"],
      effect: { kind: "grant-keyword", target: 0, keyword: "forestwalk", duration: "end-of-turn" },
      resolve: null,
      text: "{G}{G}{G}{G}, {T}: Target creature gains forestwalk until end of turn.",
    },
    {
      cost: { mana: null, tap: true },
      targets: ["creature"],
      effect: { kind: "lose-keywords", target: 0, keywords: ["forestwalk"], duration: "end-of-turn" },
      resolve: null,
      text: "{T}: Target creature loses forestwalk until end of turn.",
    },
  ],
});
