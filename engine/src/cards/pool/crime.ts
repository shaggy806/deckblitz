import { defineCard } from "../define.js";

// The left half of Crime // Punishment. An Aura put onto the battlefield this
// way is attached as it enters, its new controller choosing (rule 303.4f).
const FACES = ["Crime // Punishment", "Crime", "Punishment"];

export default defineCard({
  name: "Crime",
  manaCost: "{3}{W}{B}",
  colors: ["W", "B"],
  types: ["sorcery"],
  text: "Put target creature or enchantment card from an opponent's graveyard onto the battlefield under your control.",
  targets: [{ kind: "card-in-graveyard", whose: "opponent", filter: { typesAnyOf: ["creature", "enchantment"] } }],
  effect: { kind: "put-onto-battlefield", target: 0, underYourControl: true },
  faces: FACES,
  split: true,
});
