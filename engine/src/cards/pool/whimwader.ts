import { defineCard } from "../define.js";

const TEXT = "This creature can't attack unless defending player controls a blue permanent.";

export default defineCard({
  name: "Whimwader",
  manaCost: "{4}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Elemental"],
  power: 6,
  toughness: 4,
  text: TEXT,
  static: [{ affects: { scope: "self" }, restrictions: [{ kind: "cant-attack", unlessDefender: { controls: { colors: ["U"] } } }], text: TEXT }],
});
