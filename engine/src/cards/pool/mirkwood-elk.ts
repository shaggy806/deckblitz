import { defineCard } from "../define.js";

const TEXT =
  "Whenever this creature enters or attacks, return target Elf card from your graveyard to your hand. You gain life equal to that card's power.";
const ELF_CARD = { kind: "card-in-graveyard", whose: "you", filter: { subtype: "Elf" } } as const;
const RETURN_AND_GAIN = {
  kind: "sequence",
  effects: [
    { kind: "return-to-hand", target: 0, from: "graveyard" },
    // Ruling: an Elf card with no power gains 0 life.
    { kind: "gain-life", amount: { powerOf: 0 } },
  ],
} as const;

export default defineCard({
  name: "Mirkwood Elk",
  manaCost: "{5}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Elk"],
  power: 6,
  toughness: 6,
  keywords: ["trample"],
  text: `Trample\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [ELF_CARD],
      effect: RETURN_AND_GAIN,
      resolve: null,
      text: TEXT,
    },
    {
      trigger: { on: "attacks", who: "self" },
      sameAbilityAs: 0,
      targets: [ELF_CARD],
      effect: RETURN_AND_GAIN,
      resolve: null,
      text: TEXT,
    },
  ],
});
