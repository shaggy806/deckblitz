import { defineCard } from "../define.js";

// EDHREC rank 31816.

export default defineCard({
  name: "Rebuking Ceremony",
  manaCost: "{3}{G}{G}",
  colors: ["G"],
  types: ["sorcery"],
  text: "Put two target artifacts on top of their owners' libraries.",
  targets: ["artifact", { kind: "other", of: "artifact", than: { slots: [0] } }],
  effect: { kind: "put-on-libraries", what: { targetsFrom: 0 }, position: "top" },
});
