import { defineCard } from "../define.js";

// "If it was enchanted / equipped" is read off the creature as it last
// existed on the battlefield (rule 603.10a), as Koll, the Forgemaster's
// filter is.

const PT_TEXT = "This creature gets +1/+1 for each Aura and Equipment attached to it.";
const ENCHANTED_TEXT = "When this creature dies, if it was enchanted, create a Junk token.";
const EQUIPPED_TEXT = "When this creature dies, if it was equipped, create a Junk token.";

export default defineCard({
  name: "Gunner Conscript",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Human", "Mercenary"],
  power: 2,
  toughness: 2,
  keywords: ["trample"],
  text: `Trample\n${PT_TEXT}\n${ENCHANTED_TEXT}\n${EQUIPPED_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      grantPtPerCount: { filter: { subtypes: ["Aura", "Equipment"], attachedTo: { isSource: true } }, pt: [1, 1] },
      text: PT_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "dies", who: "self", filter: { enchanted: true } },
      targets: [],
      effect: { kind: "create-token", token: "Junk Token", count: 1 },
      resolve: null,
      text: ENCHANTED_TEXT,
    },
    {
      trigger: { on: "dies", who: "self", filter: { equipped: true } },
      targets: [],
      effect: { kind: "create-token", token: "Junk Token", count: 1 },
      resolve: null,
      text: EQUIPPED_TEXT,
    },
  ],
});
