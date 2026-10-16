import { defineCard } from "../define.js";

// EDHREC rank 13649.
export default defineCard({
  name: "Form a Posse",
  manaCost: "{X}{R}{W}",
  colors: ["W", "R"],
  types: ["sorcery"],
  text: 'Create X 1/1 red Mercenary creature tokens with "{T}: Target creature you control gets +1/+0 until end of turn. Activate only as a sorcery."',
  effect: { kind: "create-token", token: "Mercenary Token", count: "x" },
});
