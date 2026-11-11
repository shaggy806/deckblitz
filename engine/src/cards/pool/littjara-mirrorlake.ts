import { defineCard } from "../define.js";

// EDHREC rank 7463.
//
// - "Except it enters with an additional +1/+1 counter on it" is the copy
//   effect's `withCounters`: an additional effect on how the token enters,
//   not a change to what it copies (rule 707.9e), so the counter goes on
//   with whatever else it enters with (rule 122.6) and a copy of the token
//   gets none of it.
const TAPPED_TEXT = "This land enters tapped.";
const MANA_TEXT = "{T}: Add {U}.";
const COPY_TEXT =
  "{2}{G}{G}{U}, {T}, Sacrifice this land: Create a token that's a copy of target creature you control, except it enters with an additional +1/+1 counter on it. Activate only as a sorcery.";

export default defineCard({
  name: "Littjara Mirrorlake",
  colors: [],
  types: ["land"],
  text: `${TAPPED_TEXT}\n${MANA_TEXT}\n${COPY_TEXT}`,
  static: [{ affects: { scope: "self" }, replacement: { event: "enters-battlefield", tapped: true }, text: TAPPED_TEXT }],
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "add-mana", mana: "U", amount: 1 },
      resolve: null,
      text: MANA_TEXT,
    },
    {
      cost: { mana: "{2}{G}{G}{U}", tap: true, sacrifice: "self" },
      targets: ["creature-you-control"],
      effect: { kind: "create-token-copy", of: 0, count: 1, withCounters: { kind: "+1/+1", amount: 1 } },
      resolve: null,
      text: COPY_TEXT,
      sorcerySpeed: true,
    },
  ],
});
