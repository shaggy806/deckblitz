/**
 * "Enchant creature. As this Aura enters, choose a creature. Enchanted
 * creature is a copy of the chosen creature." (Metamorphic Alteration): the
 * static's `copyOfChosen` — the chosen creature's copiable values locked in as
 * it's chosen (`chosenCopy`), begun as a copy effect on what the Aura is
 * attached to for as long as it stays attached (`Game.refreshStaticCopies`),
 * following the Aura to its next creature, and replaced for good by a later
 * copy effect (rule 613.7a). Need key static:aura-enchanted-is-copy-of-chosen.
 */

import { describe, expect, it } from "vitest";

import { A, B, activate, cast, destroy, lands, pickPermanents, pt, ref, settle, spawn, table, toHand, toStep, types, zone } from "./harness.js";
import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import { nameOf } from "../state.js";

const name = (game: Game, id: ObjectId): string => nameOf(game.state.objects[id]);

/** Alice casts Metamorphic Alteration on `host`, choosing `chosen`. */
function alter(game: Game, a: Parameters<typeof pickPermanents>[0], host: ObjectId, chosen: ObjectId): ObjectId {
  lands(game, "Island", 2);
  const aura = toHand(game, "Metamorphic Alteration");
  const seen = pickPermanents(a, chosen);
  cast(game, aura, { targets: [ref(host)] });
  expect(seen.offered).toContain(chosen);
  return aura;
}

describe("Metamorphic Alteration", () => {
  it("makes the enchanted creature a copy of the chosen creature", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears");
    const angel = spawn(game, "Serra Angel", B);
    const aura = alter(game, a, bears, angel);
    expect(zone(game, aura)).toBe("battlefield");
    expect(name(game, bears)).toBe("Serra Angel");
    expect(pt(game, bears)).toEqual({ power: 4, toughness: 4 });
    expect(game.state.objects[bears].controller).toBe(A);
  });

  it("can make it a copy of itself, and offers only creatures on the battlefield", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears");
    const forest = spawn(game, "Forest");
    lands(game, "Island", 2);
    const card = toHand(game, "Metamorphic Alteration");
    const seen = pickPermanents(a, bears);
    cast(game, card, { targets: [ref(bears)] });
    expect(seen.offered).not.toContain(forest);
    expect(name(game, bears)).toBe("Grizzly Bears");
    expect(pt(game, bears)).toEqual({ power: 2, toughness: 2 });
  });

  it("locks in the chosen creature's values: what it becomes or where it goes later changes nothing", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears");
    const giant = spawn(game, "Hill Giant", B);
    const angel = spawn(game, "Serra Angel", B);
    alter(game, a, bears, giant);
    game.debugApplyEffect(B, { kind: "become-copy", target: 0, of: 1 }, [ref(giant), ref(angel)]);
    settle(game);
    expect(name(game, giant)).toBe("Serra Angel");
    expect(name(game, bears)).toBe("Hill Giant");
    destroy(game, giant);
    expect(name(game, bears)).toBe("Hill Giant");
    expect(pt(game, bears)).toEqual({ power: 3, toughness: 3 });
  });

  it("copies what the chosen creature is copying", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears");
    const giant = spawn(game, "Hill Giant", B);
    const angel = spawn(game, "Serra Angel", B);
    game.debugApplyEffect(B, { kind: "become-copy", target: 0, of: 1 }, [ref(giant), ref(angel)]);
    settle(game);
    alter(game, a, bears, giant);
    expect(name(game, bears)).toBe("Serra Angel");
  });

  it("ends as the Aura leaves: the creature is itself again", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears");
    const angel = spawn(game, "Serra Angel", B);
    const aura = alter(game, a, bears, angel);
    destroy(game, aura);
    expect(zone(game, aura)).toBe("graveyard");
    expect(name(game, bears)).toBe("Grizzly Bears");
    expect(pt(game, bears)).toEqual({ power: 2, toughness: 2 });
  });

  it("follows the Aura to another creature", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears");
    const giant = spawn(game, "Hill Giant");
    const angel = spawn(game, "Serra Angel", B);
    const aura = alter(game, a, bears, angel);
    game.debugApplyEffect(A, { kind: "attach", target: 0, attachment: 1 }, [ref(giant), ref(aura)]);
    // A debug effect runs no state-based check: the next priority does.
    toStep(game, "begin-combat");
    expect(game.state.objects[aura].attachedTo).toBe(giant);
    expect(name(game, bears)).toBe("Grizzly Bears");
    expect(name(game, giant)).toBe("Serra Angel");
  });

  it("is replaced for good by a later copy effect on the creature (rule 613.7a)", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears");
    const giant = spawn(game, "Hill Giant", B);
    const angel = spawn(game, "Serra Angel", B);
    alter(game, a, bears, angel);
    game.debugApplyEffect(A, { kind: "become-copy", target: 0, of: 1 }, [ref(bears), ref(giant)]);
    settle(game);
    expect(name(game, bears)).toBe("Hill Giant");
    // Another state-based check doesn't bring the Aura's copy back.
    toStep(game, "begin-combat");
    expect(name(game, bears)).toBe("Hill Giant");
  });

  it("a copy of a land animated into a creature isn't a creature: the Aura falls off and it's itself again", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears");
    const vault = spawn(game, "Mutavault");
    lands(game, "Wastes", 1);
    activate(game, vault, 1);
    expect(types(game, vault)).toContain("creature");
    const aura = alter(game, a, bears, vault);
    expect(zone(game, aura)).toBe("graveyard");
    expect(name(game, bears)).toBe("Grizzly Bears");
    expect(types(game, bears)).toContain("creature");
  });
});
