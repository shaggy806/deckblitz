import { defineCard } from "../define.js";

// EDHREC rank 20479.
// Makes Heartwood → "Heartwood Token".
//
// Rulings:
//   [2026-08-21] Heartwood tokens are a kind of predefined token. Each one is a red and green
//     artifact with the artifact subtype Heartwood and the ability "{T}: Add {R} or {G}."
//
// "Your choice of" is chosen as the ability resolves (Assassin Initiate's
// shape), after the counter is put on.

const ETB_TEXT = "When this creature enters, create a Heartwood token.";
const GROW_TEXT =
  "{1}, Sacrifice another artifact: Put a +1/+1 counter on this creature. It gains your choice of trample, hexproof, or haste until end of turn.";

const gains = (keyword: "trample" | "hexproof" | "haste", text: string) =>
  ({ text, effect: { kind: "grant-keyword", target: "source", keyword, duration: "end-of-turn" } }) as const;

export default defineCard({
  name: "Hungering Puppetbeast",
  manaCost: "{3}{G}{G}",
  colors: ["G"],
  types: ["artifact", "creature"],
  subtypes: ["Beast", "Construct"],
  power: 5,
  toughness: 5,
  text: `${ETB_TEXT} (It's a red and green artifact with "{T}: Add {R} or {G}.")\n${GROW_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Heartwood Token", count: 1 },
      resolve: null,
      text: ETB_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: "{1}", tap: false, sacrifice: { filter: { type: "artifact" } } },
      otherOnly: true,
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
          {
            kind: "modal",
            minModes: 1,
            maxModes: 1,
            modes: [gains("trample", "Trample"), gains("hexproof", "Hexproof"), gains("haste", "Haste")],
          },
        ],
      },
      resolve: null,
      text: GROW_TEXT,
    },
  ],
});
