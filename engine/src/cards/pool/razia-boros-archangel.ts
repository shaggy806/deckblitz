import { defineCard } from "../define.js";

// Ravnica: City of Guilds (RAV). EDHREC rank 20329.
//
// Carom's redirection shield at 3, on a creature you control: used up over
// as many damage events as it takes (the second ruling), and doing nothing
// while the second creature is gone (the first ruling — `redirectTo`'s
// rule 614.9 check). Razia leaving doesn't matter.

const TEXT =
  "{T}: The next 3 damage that would be dealt to target creature you control this turn is dealt to another target creature instead.";

export default defineCard({
  name: "Razia, Boros Archangel",
  manaCost: "{4}{R}{R}{W}{W}",
  colors: ["W", "R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Angel"],
  power: 6,
  toughness: 3,
  keywords: ["flying", "vigilance", "haste"],
  text: `Flying, vigilance, haste\n${TEXT}`,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: ["creature-you-control", { kind: "other", of: "creature", than: { slot: 0 } }],
      effect: { kind: "prevent-damage", target: 0, amount: 3, redirectTo: 1 },
      resolve: null,
      text: TEXT,
    },
  ],
});
