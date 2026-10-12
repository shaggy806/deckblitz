import { defineCard } from "../define.js";

export default defineCard({
  name: "Carrion Call",
  manaCost: "{3}{G}",
  colors: ["G"],
  types: ["instant"],
  text: "Create two 1/1 green Phyrexian Insect creature tokens with infect. (They deal damage to creatures in the form of -1/-1 counters and to players in the form of poison counters.)",
  effect: { kind: "create-token", token: "Phyrexian Insect Token", count: 2 },
});
