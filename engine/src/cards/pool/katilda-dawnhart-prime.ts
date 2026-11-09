import { defineCard } from "../define.js";

// "Any of this creature's colors" is Mox Amber's `colorAmong`, the filter being
// the creature activating the granted ability itself: a colorless one makes none.
const TEXT = `Human creatures you control have "{T}: Add one mana of any of this creature's colors."`;
const COUNTERS_TEXT = "{4}{G}{W}, {T}: Put a +1/+1 counter on each creature you control.";

export default defineCard({
  name: "Katilda, Dawnhart Prime",
  manaCost: "{G}{W}",
  colors: ["G", "W"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Warlock"],
  power: 1,
  toughness: 1,
  text: `Protection from Werewolves\n${TEXT}\n${COUNTERS_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      protection: { filter: { subtype: "Werewolf" } },
      text: "Protection from Werewolves",
    },
    {
      affects: { scope: "creatures-you-control", subtype: "Human" },
      grantsActivated: [
        {
          cost: { mana: null, tap: true },
          targets: [],
          effect: { kind: "add-mana", mana: { colorAmong: { isSource: true } }, amount: 1 },
          resolve: null,
          text: "{T}: Add one mana of any of this creature's colors.",
        },
      ],
      text: TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: "{4}{G}{W}", tap: true },
      targets: [],
      effect: { kind: "add-counter-all", filter: { type: "creature", controlledBy: "you" }, counter: "+1/+1", amount: 1 },
      resolve: null,
      text: COUNTERS_TEXT,
    },
  ],
});
