import { defineCard } from "../define.js";

// An X/X colorless Golem artifact creature with haste — Vulshok Factory's token. Its X is
// set by the effect that makes it (`create-token`'s `basePt`); printed, it's 0/0.
export default defineCard({
  name: "X/X Golem Token (Haste)",
  art: "621738c7-24f6-469e-9e44-8c80cd85ba08",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Golem"],
  power: 0,
  toughness: 0,
  keywords: ["haste"],
  text: "Haste",
});
