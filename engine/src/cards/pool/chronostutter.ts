import { defineCard } from "../define.js";

export default defineCard({
  name: "Chronostutter",
  manaCost: "{5}{U}",
  colors: ["U"],
  types: ["instant"],
  text: "Put target creature into its owner's library second from the top.",
  targets: ["creature"],
  effect: { kind: "put-on-library", target: 0, position: { fromTop: 2 } },
});
