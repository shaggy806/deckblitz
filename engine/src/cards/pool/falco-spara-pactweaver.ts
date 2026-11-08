import { defineCard } from "../define.js";

const SHIELD_TEXT = "Falco Spara enters with a shield counter on it.";
const TEXT =
  "You may cast spells from the top of your library by removing a counter from a creature you control in addition to paying their other costs.";

export default defineCard({
  name: "Falco Spara, Pactweaver",
  manaCost: "{1}{G}{W}{U}",
  colors: ["G", "W", "U"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Bird", "Demon"],
  power: 3,
  toughness: 3,
  keywords: ["flying", "trample"],
  looksAtOwnLibraryTop: true,
  text: `Flying, trample\n${SHIELD_TEXT}\nYou may look at the top card of your library any time.\n${TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", counters: { kind: "shield", amount: 1 } },
      text: SHIELD_TEXT,
    },
    {
      affects: { scope: "self" },
      mayPlay: { from: "library-top", do: { kind: "remove-counters", from: { type: "creature" }, counter: "any", count: 1 } },
      text: TEXT,
    },
  ],
});
