/**
 * A layer-4 static whose scope asks for what *lacks* a type it then adds
 * (March of the Machines: "Each noncreature artifact is an artifact creature")
 * depends on whatever makes a permanent an artifact (rule 613.8a), so it
 * applies after that effect whichever arrived first (613.8b). Found by the
 * 2026-11-18 review: with March on the battlefield first, the fold dropped it
 * on every other pass, hidden by the "creature" it had added itself.
 */
import { describe, expect, it } from "vitest";

import { B, cast, lands, pt, spawn, table, toHand, types, zone } from "./harness.js";

describe("a static that adds the type its own scope excludes (rule 613.8)", () => {
  it("March of the Machines, then Mycosynth Lattice: lands are 0/0 artifact creatures and die", () => {
    const { game } = table();
    const march = spawn(game, "March of the Machines");
    const land = spawn(game, "Wastes");
    lands(game, "Wastes", 5);
    const theirs = spawn(game, "Wastes", B);
    const lattice = toHand(game, "Mycosynth Lattice");
    cast(game, lattice);
    expect(zone(game, lattice)).toBe("battlefield");
    expect(zone(game, land)).toBe("graveyard");
    expect(zone(game, theirs)).toBe("graveyard");
    expect(types(game, lattice)).toContain("creature");
    expect(pt(game, lattice)).toEqual({ power: 6, toughness: 6 });
    expect(types(game, march)).toContain("creature");
    expect(pt(game, march)).toEqual({ power: 4, toughness: 4 });
  });

  it("the other order, Lattice then March, comes to the same", () => {
    const { game } = table();
    const lattice = spawn(game, "Mycosynth Lattice");
    const land = spawn(game, "Wastes");
    lands(game, "Island", 4);
    const theirs = spawn(game, "Wastes", B);
    const march = toHand(game, "March of the Machines");
    cast(game, march);
    expect(zone(game, land)).toBe("graveyard");
    expect(zone(game, theirs)).toBe("graveyard");
    expect(pt(game, lattice)).toEqual({ power: 6, toughness: 6 });
    expect(pt(game, march)).toEqual({ power: 4, toughness: 4 });
  });

  it("March of the Machines, then Encroaching Mycosynth: an enchantment made an artifact is a creature", () => {
    const { game } = table();
    spawn(game, "March of the Machines");
    const anthem = spawn(game, "Glorious Anthem");
    lands(game, "Island", 4);
    cast(game, toHand(game, "Encroaching Mycosynth"));
    expect(types(game, anthem)).toEqual(expect.arrayContaining(["enchantment", "artifact", "creature"]));
    // Mana value 3, and its own +1/+1 now reaches it.
    expect(pt(game, anthem)).toEqual({ power: 4, toughness: 4 });
  });

  it("March alone still leaves a creature another effect made as it is", () => {
    const { game } = table();
    spawn(game, "March of the Machines");
    // An artifact creature already: March's "noncreature" passes it over,
    // so it keeps its printed 1/1 rather than taking its mana value.
    const myr = spawn(game, "Ornithopter");
    expect(types(game, myr)).toContain("creature");
    expect(pt(game, myr)).toEqual({ power: 0, toughness: 2 });
  });
});
