import { defineCard } from "../define.js";
import type { TriggeredAbility } from "../../abilities.js";

// EDHREC rank 29820.
// "Attacks or blocks" is two triggers (Mardu Blazebringer's shape), each
// setting up the delayed sacrifice at the next end step.

const TEXT = "When this creature attacks or blocks, sacrifice it at the beginning of the next end step.";

const sacrificeAtNextEndStep = (on: "attacks" | "blocks"): TriggeredAbility => ({
  trigger: { on, who: "self" },
  targets: [],
  effect: {
    kind: "delayed-trigger",
    at: "next-end-step",
    effect: { kind: "sacrifice-target", target: "source" },
    text: "Sacrifice Brackwater Elemental.",
  },
  resolve: null,
  text: TEXT,
});

export default defineCard({
  name: "Brackwater Elemental",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Elemental"],
  power: 4,
  toughness: 4,
  text: `${TEXT}\nUnearth {2}{U} ({2}{U}: Return this card from your graveyard to the battlefield. It gains haste. Exile it at the beginning of the next end step or if it would leave the battlefield. Unearth only as a sorcery.)`,
  activated: [
    {
      cost: { mana: "{2}{U}", tap: false },
      zone: "graveyard",
      staysInZone: true,
      sorcerySpeed: true,
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "put-onto-battlefield", target: "source", exileIfItWouldLeave: true },
          { kind: "grant-keyword", target: "source", keyword: "haste", duration: "permanent" },
          {
            kind: "delayed-trigger",
            at: "next-end-step",
            effect: { kind: "exile", target: "source" },
            text: "Exile the unearthed card.",
          },
        ],
      },
      resolve: null,
      text: "Unearth {2}{U}",
    },
  ],
  triggered: [sacrificeAtNextEndStep("attacks"), sacrificeAtNextEndStep("blocks")],
});
