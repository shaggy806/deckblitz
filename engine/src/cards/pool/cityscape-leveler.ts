import { defineCard } from "../define.js";

// One ability with two trigger conditions — its cast (`this-cast`, so not when
// unearthed) and its attacks — as two entries with the same text. The target
// is up to one; "its controller" is that permanent's controller as it last
// existed (`who: "target-controller"`), who gets the Powerstone even if the
// permanent survives (indestructible). Unearth as the pool's other unearth
// cards: a replacement of the put-onto-battlefield, then a delayed exile.
const TRIGGER_TEXT =
  "When you cast this spell and whenever this creature attacks, destroy up to one target nonland permanent. Its controller creates a tapped Powerstone token.";
const LEVEL = {
  kind: "sequence",
  effects: [
    { kind: "destroy", target: 0 },
    { kind: "create-token", token: "Powerstone Token", count: 1, tapped: true, who: "target-controller" },
  ],
} as const;
const TARGETS = [{ kind: "optional", of: { kind: "permanent", filter: { notTypes: ["land"] } } }] as const;

export default defineCard({
  name: "Cityscape Leveler",
  manaCost: "{8}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Construct"],
  power: 8,
  toughness: 8,
  keywords: ["trample"],
  text: `Trample\n${TRIGGER_TEXT}\nUnearth {8} ({8}: Return this card from your graveyard to the battlefield. It gains haste. Exile it at the beginning of the next end step or if it would leave the battlefield. Unearth only as a sorcery.)`,
  triggered: [
    { trigger: { on: "this-cast" }, targets: [...TARGETS], effect: LEVEL, resolve: null, text: TRIGGER_TEXT },
    { trigger: { on: "attacks", who: "self" }, targets: [...TARGETS], effect: LEVEL, resolve: null, text: TRIGGER_TEXT },
  ],
  activated: [
    {
      cost: { mana: "{8}", tap: false },
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
      text: "Unearth {8}",
    },
  ],
});
