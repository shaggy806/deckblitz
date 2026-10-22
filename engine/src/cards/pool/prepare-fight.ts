import { defineCard } from "../define.js";

const FACES = ["Prepare // Fight", "Prepare", "Fight"];

export default defineCard({
  name: "Prepare // Fight",
  manaCost: "{1}{W}{3}{G}",
  colors: ["W", "G"],
  types: ["instant", "sorcery"],
  text: "Untap target creature. It gets +2/+2 and gains lifelink until end of turn.\n//\nAftermath (Cast this spell only from your graveyard. Then exile it.)\nTarget creature you control fights target creature an opponent controls.",
  faces: FACES,
  split: true,
});
