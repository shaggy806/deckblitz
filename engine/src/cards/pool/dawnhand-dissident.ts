import { defineCard } from "../define.js";

const PERMISSION_TEXT =
  "During your turn, you may cast creature spells from among cards you own exiled with this creature by removing three counters from among creatures you control in addition to paying their other costs.";

// The two activated abilities exile and surveil as printed; only cards
// exiled with this creature, in this stint of it (rule 607.2a), may be cast.
export default defineCard({
  name: "Dawnhand Dissident",
  manaCost: "{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Elf", "Warlock"],
  power: 1,
  toughness: 2,
  text:
    "{T}, Blight 1: Surveil 1. (To blight 1, put a -1/-1 counter on a creature you control.)\n" +
    "{T}, Blight 2: Exile target card from a graveyard.\n" +
    PERMISSION_TEXT,
  activated: [
    {
      cost: { mana: null, tap: true, blight: 1 },
      targets: [],
      effect: { kind: "surveil", amount: 1 },
      resolve: null,
      text: "{T}, Blight 1: Surveil 1.",
    },
    {
      cost: { mana: null, tap: true, blight: 2 },
      targets: [{ kind: "card-in-graveyard", whose: "any" }],
      effect: { kind: "exile", target: 0, linked: true },
      resolve: null,
      text: "{T}, Blight 2: Exile target card from a graveyard.",
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      mayPlay: {
        from: "exile",
        linked: true,
        filter: { ownedBy: "you" },
        spell: { type: "creature" },
        yourTurnOnly: true,
        do: { kind: "remove-counters", from: { type: "creature" }, counter: "any", count: 3, among: true },
      },
      text: PERMISSION_TEXT,
    },
  ],
});
