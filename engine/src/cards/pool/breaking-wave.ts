import { defineCard } from "../define.js";

// EDHREC rank 22969. The flash for {2} more is Ghitu Fire's kicker shape;
// "simultaneously untap all tapped creatures and tap all untapped creatures"
// is `tap-all`'s `swap`, which reads which are tapped once before turning any.
export default defineCard({
  name: "Breaking Wave",
  manaCost: "{2}{U}{U}",
  colors: ["U"],
  types: ["sorcery"],
  kicker: { cost: "{2}", keyword: "flash", flash: true },
  text: "You may cast this spell as though it had flash if you pay {2} more to cast it. (You may cast it any time you could cast an instant.)\nSimultaneously untap all tapped creatures and tap all untapped creatures.",
  effect: { kind: "tap-all", filter: { type: "creature" }, swap: true },
});
