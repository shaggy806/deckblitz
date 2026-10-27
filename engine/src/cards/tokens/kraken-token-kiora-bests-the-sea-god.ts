import { defineCard } from "../define.js";

/** 8/8 blue Kraken with hexproof — Kiora Bests the Sea God's token. */
export default defineCard({
  name: "Kraken Token (Kiora Bests the Sea God)",
  art: "c3365aea-823d-44a9-94d3-ed2a31d85f34",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Kraken"],
  power: 8,
  toughness: 8,
  keywords: ["hexproof"],
  text: "Hexproof (This creature can't be the target of spells or abilities your opponents control.)",
});
