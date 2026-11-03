/**
 * One target slot over players and permanents, each part with its own filter:
 * `permanent`'s `orPlayer`, with `typesAnyOf` or `anyOf` for the permanents (rule
 * 115.4 for "any target"). Wrathful Red Dragon, Wrathful Raptors, Lozhan, Coalborn
 * Entity, Cautery Sliver, Captain's Maneuver.
 */

import { describe, expect, it } from "vitest";

import { describeTargetSpec } from "../target.js";
import type { TargetRef, TargetSpec } from "../target.js";
import { legalTargets } from "../targeting.js";
import {
  A,
  B,
  activate,
  cast,
  counters,
  destroy,
  grant,
  graveyard,
  lands,
  life,
  named,
  pickTargets,
  ref,
  registryOf,
  settle,
  spawn,
  table,
  toHand,
  watchTargets,
  zone,
} from "./harness.js";
import type { Game } from "../game.js";
import type { ObjectId, PlayerId } from "../primitives.js";

/** `by` deals `amount` to this object or player, as a source of `by`'s own. */
const damage = (game: Game, to: ObjectId | PlayerId, amount: number, by: PlayerId = B): void => {
  game.debugApplyEffect(by, { kind: "damage", amount, target: 0 }, [ref(to)]);
  settle(game);
};

const refFor = (id: ObjectId | PlayerId): TargetRef => ref(id);

const legal = (game: Game, spec: TargetSpec, player: PlayerId = A): readonly TargetRef[] =>
  legalTargets(game.state, registryOf(game), spec, player);

describe("any target that isn't a Dragon", () => {
  it("offers the player and every non-Dragon, and never another Dragon", () => {
    const { game, a } = table();
    const dragon = spawn(game, "Wrathful Red Dragon");
    const other = spawn(game, "Shivan Dragon");
    const bears = spawn(game, "Grizzly Bears", B);
    const walker = spawn(game, "Jace Beleren", B);
    const seen = watchTargets(a, () => [B]);
    damage(game, other, 3);
    expect(seen.offered[0]).toEqual(expect.arrayContaining([A, B, bears, walker]));
    expect(seen.offered[0]).not.toContain(dragon);
    expect(seen.offered[0]).not.toContain(other);
    expect(life(game, B)).toBe(17);
  });

  it("the damaged Dragon deals it, even a Dragon the damage killed", () => {
    const { game, a } = table();
    spawn(game, "Wrathful Red Dragon");
    const small = spawn(game, "Shivan Dragon");
    pickTargets(a, B);
    grant(game, small, "lifelink");
    damage(game, small, 7);
    expect(zone(game, small)).toBe("graveyard");
    expect(life(game, B)).toBe(13);
    // Its lifelink, as it last existed: it dealt the damage, not the Wrathful one.
    expect(life(game, A)).toBe(27);
  });

  it("doesn't see a Dragon an opponent controls, nor anything else dealt damage", () => {
    const { game } = table();
    spawn(game, "Wrathful Red Dragon");
    spawn(game, "Shivan Dragon", B);
    const bears = spawn(game, "Grizzly Bears");
    damage(game, named(game, "Shivan Dragon", B)[0], 1, A);
    damage(game, bears, 1);
    expect(life(game, B)).toBe(20);
    expect(life(game, A)).toBe(20);
  });
});

describe("Wrathful Raptors", () => {
  it("any non-Dinosaur: it can't hit itself, and hits a creature for that much", () => {
    const { game, a } = table();
    const raptors = spawn(game, "Wrathful Raptors");
    const bears = spawn(game, "Grizzly Bears", B);
    const seen = watchTargets(a, () => [bears]);
    damage(game, raptors, 2);
    expect(seen.offered[0]).not.toContain(raptors);
    expect(zone(game, bears)).toBe("graveyard");
    expect(graveyard(game, B)).toContain(bears);
  });
});

describe("any target that isn't a commander (Lozhan)", () => {
  const spellInHand = (game: Game): ObjectId => {
    lands(game, "Mountain", 6);
    return toHand(game, "Shivan Dragon");
  };

  it("includes every player and every other creature (the ruling)", () => {
    const { game, a } = table();
    spawn(game, "Lozhan, Dragons' Legacy");
    const bears = spawn(game, "Grizzly Bears", B);
    const general = spawn(game, "Hill Giant", B);
    game.state.objects[general].isCommander = true;
    const seen = watchTargets(a, () => [B]);
    cast(game, spellInHand(game));
    expect(seen.offered[0]).toEqual(expect.arrayContaining([A, B, bears]));
    expect(seen.offered[0]).not.toContain(general);
    // Shivan Dragon's mana value.
    expect(life(game, B)).toBe(14);
  });

  it("an Adventure spell counts for its own mana value; the same card cast as itself doesn't (the ruling)", () => {
    const { game, a } = table();
    spawn(game, "Lozhan, Dragons' Legacy");
    lands(game, "Mountain", 5);
    watchTargets(a, () => [B]);
    const bears = spawn(game, "Grizzly Bears", B);
    cast(game, toHand(game, "Bonecrusher Giant"), { face: 1, targets: [ref(bears)] });
    // Stomp's mana value is 2.
    expect(life(game, B)).toBe(18);
    cast(game, toHand(game, "Bonecrusher Giant"));
    expect(life(game, B)).toBe(18);
  });

  it("a spell that's neither doesn't count", () => {
    const { game } = table();
    spawn(game, "Lozhan, Dragons' Legacy");
    lands(game, "Forest", 2);
    cast(game, toHand(game, "Grizzly Bears"));
    expect(life(game, B)).toBe(20);
  });
});

describe("a creature token, a player or a planeswalker (Coalborn Entity)", () => {
  it("leaves out nontoken creatures, and lands its 1 damage on each kind", () => {
    const { game } = table();
    const entity = spawn(game, "Coalborn Entity");
    lands(game, "Mountain", 9);
    const bears = spawn(game, "Grizzly Bears", B);
    const walker = spawn(game, "Jace Beleren", B);
    game.debugApplyEffect(B, { kind: "create-token", token: "Saproling Token", count: 1 }, []);
    settle(game);
    const [token] = named(game, "Saproling Token", B);
    const spec = game.registry.get("Coalborn Entity").activated[0].targets[0];
    const offered = legal(game, spec);
    expect(offered).not.toContainEqual(refFor(bears));
    expect(offered).not.toContainEqual(refFor(entity));
    expect(offered).toContainEqual(refFor(token));
    expect(offered).toContainEqual(refFor(walker));
    expect(offered).toContainEqual(refFor(B));
    const loyalty = counters(game, walker, "loyalty");
    activate(game, entity, 0, { targets: [ref(walker)] });
    expect(counters(game, walker, "loyalty")).toBe(loyalty - 1);
    activate(game, entity, 0, { targets: [ref(B)] });
    expect(life(game, B)).toBe(19);
    activate(game, entity, 0, { targets: [ref(token)] });
    expect(named(game, "Saproling Token", B).filter((id) => game.state.objects[id]?.zone === "battlefield")).toEqual([]);
  });

  it("refuses a nontoken creature when it's activated", () => {
    const { game } = table();
    const entity = spawn(game, "Coalborn Entity");
    lands(game, "Mountain", 3);
    const bears = spawn(game, "Grizzly Bears", B);
    expect(() => activate(game, entity, 0, { targets: [ref(bears)] })).toThrow();
  });
});

describe("Cautery Sliver", () => {
  const PREVENT = 1;

  it("gives every Sliver both abilities: any creature for the damage, only Slivers for the shield", () => {
    const { game } = table();
    spawn(game, "Cautery Sliver");
    const friend = spawn(game, "Acidic Sliver", B);
    const bears = spawn(game, "Grizzly Bears", B);
    const walker = spawn(game, "Jace Beleren", B);
    const def = game.registry.get("Cautery Sliver");
    const prevent = def.static[PREVENT].grantsActivated?.[0].targets[0] as TargetSpec;
    const shieldable = legal(game, prevent);
    expect(shieldable).toContainEqual(refFor(friend));
    expect(shieldable).toContainEqual(refFor(walker));
    expect(shieldable).toContainEqual(refFor(A));
    expect(shieldable).not.toContainEqual(refFor(bears));
    const damaging = def.static[0].grantsActivated?.[0].targets[0] as TargetSpec;
    expect(legal(game, damaging)).toContainEqual(refFor(bears));
  });

  it("sacrificing a Sliver shields a player from the next 1 damage", () => {
    const { game } = table();
    const sliver = spawn(game, "Cautery Sliver");
    lands(game, "Mountain", 1);
    activate(game, sliver, PREVENT, { targets: [ref(A)] });
    expect(zone(game, sliver)).toBe("graveyard");
    damage(game, A, 3);
    expect(life(game, A)).toBe(18);
  });
});

describe("Captain's Maneuver", () => {
  const maneuver = (game: Game, from: ObjectId | PlayerId, to: ObjectId | PlayerId, x: number): void => {
    lands(game, "Plains", x + 1);
    lands(game, "Mountain", 1);
    cast(game, toHand(game, "Captain's Maneuver"), { targets: [ref(from), ref(to)], x });
  };

  it("sends the next X from a player to a planeswalker, the rest staying", () => {
    const { game } = table();
    const walker = spawn(game, "Jace Beleren", B);
    const loyalty = counters(game, walker, "loyalty");
    maneuver(game, A, walker, 2);
    damage(game, A, 3);
    expect(life(game, A)).toBe(19);
    expect(counters(game, walker, "loyalty")).toBe(loyalty - 2);
  });

  it("sends a creature's damage to a player", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears");
    maneuver(game, bears, B, 2);
    damage(game, bears, 2);
    expect(game.state.objects[bears].damageMarked).toBe(0);
    expect(life(game, B)).toBe(18);
  });

  it("with the second target gone, the damage is dealt to the first as if it wasn't cast (the ruling)", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    maneuver(game, A, bears, 2);
    destroy(game, bears);
    damage(game, A, 3);
    expect(life(game, A)).toBe(17);
  });

  it("wants another target, and no land", () => {
    const { game } = table();
    const land = spawn(game, "Wastes", B);
    lands(game, "Plains", 2);
    lands(game, "Mountain", 1);
    const spell = toHand(game, "Captain's Maneuver");
    expect(() => cast(game, spell, { targets: [ref(A), ref(A)], x: 1 })).toThrow();
    expect(() => cast(game, spell, { targets: [ref(A), ref(land)], x: 1 })).toThrow();
  });
});

describe("a target an opponent's part and a player's part both narrow", () => {
  const spec: TargetSpec = {
    kind: "permanent",
    whose: "opponent",
    filter: { typesAnyOf: ["creature", "planeswalker"] },
    orPlayer: "opponent",
  };

  it("is an opponent, or a creature or planeswalker an opponent controls (Nicol Bolas, God-Pharaoh)", () => {
    const { game } = table();
    const mine = spawn(game, "Grizzly Bears");
    const theirs = spawn(game, "Grizzly Bears", B);
    const walker = spawn(game, "Jace Beleren", B);
    const land = spawn(game, "Wastes", B);
    const offered = legal(game, spec);
    expect(offered).toContainEqual(refFor(B));
    expect(offered).toContainEqual(refFor(theirs));
    expect(offered).toContainEqual(refFor(walker));
    expect(offered).not.toContainEqual(refFor(A));
    expect(offered).not.toContainEqual(refFor(mine));
    expect(offered).not.toContainEqual(refFor(land));
  });

  it("says so in its description", () => {
    expect(describeTargetSpec(spec)).toBe("creature or planeswalker an opponent controls or opponent");
    expect(
      describeTargetSpec({
        kind: "permanent",
        filter: { anyOf: [{ type: "planeswalker" }, { type: "creature", subtype: "Sliver" }] },
        orPlayer: "any",
      }),
    ).toBe("planeswalker or Sliver creature or player");
  });
});
