import { defineCard } from "../define.js";
import { training } from "../helpers.js";

/** 1/1 green and white Human Soldier with training — Torens, Fist of the Angels's token. */
export default defineCard({
  name: "Human Soldier Token (Torens, Fist of the Angels)",
  art: "e35e232f-e98b-49c7-a68c-d8e3339e90b5",
  colors: ["W", "G"],
  types: ["creature"],
  subtypes: ["Human", "Soldier"],
  power: 1,
  toughness: 1,
  text: "Training (Whenever this creature attacks with another creature with greater power, put a +1/+1 counter on this creature.)",
  triggered: [training()],
});
