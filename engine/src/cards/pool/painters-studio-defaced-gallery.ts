import { roomCard } from "../helpers.js";
import left from "./painters-studio.js";
import right from "./defaced-gallery.js";

// EDHREC rank 10497. A Room (rule 709.5): each door is cast on its own and
// enters unlocked; the other is unlocked by paying its mana cost as a
// sorcery.
export default roomCard("Painter's Studio // Defaced Gallery", left, right);
