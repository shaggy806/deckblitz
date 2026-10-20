import { defineCard } from "../define.js";

const GRANT_TEXT = "Other Wolves and Werewolves you control have trample.";

export default defineCard({
  name: "Untamed Pup",
  art: "https://cards.scryfall.io/art_crop/back/2/8/28e2119b-ed78-4b98-a956-f2b453d0b164.jpg",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Werewolf"],
  power: 4,
  toughness: 4,
  keywords: ["trample", "nightbound"],
  text: `Trample\n${GRANT_TEXT}\n{3}{G}: Put a +1/+1 counter on target creature.\nNightbound (If a player casts at least two spells during their own turn, it becomes day next turn.)`,
  static: [
    {
      affects: {
        scope: "filter",
        filter: { type: "creature", controlledBy: "you", subtypes: ["Wolf", "Werewolf"] },
        excludeSelf: true,
      },
      grantKeywords: ["trample"],
      text: GRANT_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: "{3}{G}", tap: false },
      targets: ["creature"],
      effect: { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 },
      resolve: null,
      text: "{3}{G}: Put a +1/+1 counter on target creature.",
    },
  ],
  faces: ["Hound Tamer", "Untamed Pup"],
  transform: true,
});
