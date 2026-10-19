import { defineCard } from "../define.js";

// An X/X colorless Golem artifact creature — Mask of the Jadecrafter's token. Its X is set by
// the effect that makes it (`create-token`'s `basePt`); printed, it's 0/0.
export default defineCard({
  name: "X/X Golem Token",
  art: "474c8cfe-71ce-46c7-8cf4-dfeae3c0e73b",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Golem"],
  power: 0,
  toughness: 0,
  text: "",
});
