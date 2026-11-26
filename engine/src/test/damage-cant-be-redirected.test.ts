/**
 * Damage that "can't be prevented or dealt instead to another permanent or
 * player" (rules 615.12, 614.9): prevention effects prevent none of it and no
 * redirection applies to it. Lava Burst's own damage to a creature (the
 * `damage` effect's `toCreaturesUnstoppable` — not to a player), and
 * Whippoorwill's "damage that would be dealt to that creature this turn"
 * (a `have-damage-prevented` prohibition with `orRedirected`), beside its
 * "can't be regenerated" and "when the creature dies this turn, exile it".
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";

import { A, B, activate, cast, lands, life, ref, spawn, table, toHand, zone } from "./harness.js";

const damage = (game: Game, id: ObjectId): number => game.state.objects[id].damageMarked;

/** Bob's shield: "prevent the next 3 damage that would be dealt to" it. */
const shield = (game: Game, on: ObjectId | "bob"): void => {
  game.debugApplyEffect(B, { kind: "prevent-damage", target: 0, amount: 3 }, [on === "bob" ? ref(B) : ref(on)]);
};

/** Alice casts Lava Burst for `x` at `at`. */
const lavaBurst = (game: Game, x: number, at: ObjectId | "bob"): void => {
  lands(game, "Mountain", x + 1);
  cast(game, toHand(game, "Lava Burst"), { x, targets: [at === "bob" ? ref(B) : ref(at)] });
};

describe("Lava Burst", () => {
  it("its damage to a creature can't be prevented", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    shield(game, bears);
    lavaBurst(game, 2, bears);
    expect(zone(game, bears)).toBe("graveyard");
  });

  it("its damage to a creature isn't redirected (Palisade Giant)", () => {
    const { game } = table();
    const giant = spawn(game, "Palisade Giant", B);
    const bears = spawn(game, "Grizzly Bears", B);
    lavaBurst(game, 2, bears);
    expect(damage(game, giant)).toBe(0);
    expect(zone(game, bears)).toBe("graveyard");
  });

  it("its damage to a player can still be prevented and redirected", () => {
    const { game } = table();
    shield(game, "bob");
    lavaBurst(game, 4, "bob");
    expect(life(game, B)).toBe(19);
    const other = table();
    const giant = spawn(other.game, "Palisade Giant", B);
    lavaBurst(other.game, 2, "bob");
    expect(life(other.game, B)).toBe(20);
    expect(damage(other.game, giant)).toBe(2);
  });
});

describe("Whippoorwill", () => {
  /** Alice's Whippoorwill aimed at `at`. */
  const whip = (game: Game, at: ObjectId): void => {
    const bird = spawn(game, "Whippoorwill", A);
    lands(game, "Forest", 2);
    activate(game, bird, 0, { targets: [ref(at)] });
  };

  it("damage to the creature this turn can't be prevented, and when it dies it's exiled", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    shield(game, bears);
    whip(game, bears);
    lands(game, "Mountain", 1);
    cast(game, toHand(game, "Lightning Bolt"), { targets: [ref(bears)] });
    expect(zone(game, bears)).toBe("exile");
  });

  it("damage to the creature isn't redirected (Palisade Giant)", () => {
    const { game } = table();
    const giant = spawn(game, "Palisade Giant", B);
    const ogre = spawn(game, "Gray Ogre", B);
    whip(game, ogre);
    lands(game, "Mountain", 1);
    cast(game, toHand(game, "Lightning Bolt"), { targets: [ref(ogre)] });
    expect(damage(game, giant)).toBe(0);
    expect(zone(game, ogre)).toBe("exile");
  });

  it("the creature can't be regenerated this turn", () => {
    const { game } = table();
    const skeletons = spawn(game, "Drudge Skeletons", B);
    game.debugApplyEffect(B, { kind: "regenerate", target: 0 }, [ref(skeletons)]);
    whip(game, skeletons);
    lands(game, "Mountain", 1);
    cast(game, toHand(game, "Lightning Bolt"), { targets: [ref(skeletons)] });
    expect(zone(game, skeletons)).toBe("exile");
  });

  it("damage to another creature is untouched", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    const ogre = spawn(game, "Gray Ogre", B);
    shield(game, ogre);
    whip(game, bears);
    lands(game, "Mountain", 1);
    cast(game, toHand(game, "Lightning Bolt"), { targets: [ref(ogre)] });
    expect(zone(game, ogre)).toBe("battlefield");
    expect(zone(game, bears)).toBe("battlefield");
  });
});
