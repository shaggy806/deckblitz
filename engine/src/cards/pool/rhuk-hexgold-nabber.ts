import { defineCard } from "../define.js";

/** "You may attach all Equipment attached to that creature to Rhuk": all or
 * none (the ruling), read as the creature is now — or, once it has died, as
 * it last existed (rule 608.2h). */
const nab = {
  kind: "may",
  prompt: "Attach all Equipment attached to that creature to Rhuk?",
  effect: { kind: "attach", target: "source", attachments: { subtype: "Equipment", wasAttachedTo: "trigger-object" } },
} as const;

export default defineCard({
  name: "Rhuk, Hexgold Nabber",
  art: "https://scryfall.com/card/one/407",
  manaCost: "{2}{R}",
  colors: ["R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Goblin", "Rebel"],
  power: 2,
  toughness: 2,
  keywords: ["trample", "haste"],
  text: "Trample, haste\nWhenever an equipped creature you control other than Rhuk attacks or dies, you may attach all Equipment attached to that creature to Rhuk.",
  triggered: [
    {
      trigger: { on: "attacks", who: "you-control", filter: { type: "creature", equipped: true }, otherOnly: true },
      targets: [],
      effect: nab,
      resolve: null,
      text: "Whenever an equipped creature you control other than Rhuk attacks or dies, you may attach all Equipment attached to that creature to Rhuk.",
    },
    {
      trigger: { on: "dies", who: "you-control", filter: { type: "creature", equipped: true }, otherOnly: true },
      targets: [],
      effect: nab,
      resolve: null,
      text: "Whenever an equipped creature you control other than Rhuk attacks or dies, you may attach all Equipment attached to that creature to Rhuk.",
    },
  ],
});
