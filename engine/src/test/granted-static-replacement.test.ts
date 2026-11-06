/**
 * A granted static that is a replacement or prevention effect works from the
 * object that has it (rule 113.10): Caduceus, Staff of Hermes's equipped
 * creature has "Prevent all damage that would be dealt to this creature"
 * while its controller has 30 or more life (rule 615.1, a prevention effect,
 * applied as the damage would be dealt — 615.1a). Every static scan through
 * `staticsOfSource` reads a granted static as the object's own.
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import { A, B, activate, attack, cast, keywords, lands, life, pt, ref, spawn, table, toHand, zone } from "./harness.js";

const damage = (game: Game, id: ObjectId): number => game.state.objects[id].damageMarked;

/** Alice's Hill Giant wearing Caduceus, Alice at `at` life. */
function equipped(at: number) {
  const t = table();
  const { game } = t;
  game.state.players[A].life = at;
  lands(t.game, "Plains", 2);
  const caduceus = spawn(game, "Caduceus, Staff of Hermes");
  const giant = spawn(game, "Hill Giant");
  activate(game, caduceus, 0, { targets: [ref(giant)] });
  expect(game.state.objects[caduceus].attachedTo).toBe(giant);
  return { ...t, caduceus, giant };
}

describe("Caduceus, Staff of Hermes", () => {
  it("at 30 or more life: +5/+5, lifelink, indestructible, and damage to it is prevented", () => {
    const { game, giant } = equipped(30);
    expect(pt(game, giant)).toEqual({ power: 8, toughness: 8 });
    expect(keywords(game, giant).has("lifelink")).toBe(true);
    expect(keywords(game, giant).has("indestructible")).toBe(true);
    lands(game, "Mountain", 1);
    cast(game, toHand(game, "Lightning Bolt"), { targets: [ref(giant)] });
    expect(damage(game, giant)).toBe(0);
  });

  it("below 30 life: only lifelink, and damage is dealt", () => {
    const { game, giant } = equipped(29);
    expect(pt(game, giant)).toEqual({ power: 3, toughness: 3 });
    expect(keywords(game, giant).has("lifelink")).toBe(true);
    expect(keywords(game, giant).has("indestructible")).toBe(false);
    lands(game, "Mountain", 1);
    cast(game, toHand(game, "Lightning Bolt"), { targets: [ref(giant)] });
    expect(zone(game, giant)).toBe("graveyard");
  });

  it("the prevention is the equipped creature's own: it prevents nothing dealt to another creature", () => {
    const { game } = equipped(30);
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Mountain", 1);
    cast(game, toHand(game, "Lightning Bolt"), { targets: [ref(bears)] });
    expect(zone(game, bears)).toBe("graveyard");
  });

  it("goes with the Equipment's controller's life, not the creature's controller's", () => {
    const { game, giant } = equipped(30);
    game.state.players[B].life = 10;
    lands(game, "Mountain", 1);
    cast(game, toHand(game, "Lightning Bolt"), { targets: [ref(giant)] });
    expect(damage(game, giant)).toBe(0);
  });

  it("a creature that lost its abilities before it was equipped still has the prevention (rule 613.7)", () => {
    const { game } = table();
    game.state.players[A].life = 30;
    lands(game, "Plains", 2);
    const caduceus = spawn(game, "Caduceus, Staff of Hermes");
    const giant = spawn(game, "Hill Giant");
    game.debugApplyEffect(B, { kind: "lose-abilities", target: 0, duration: "end-of-turn" }, [ref(giant)]);
    activate(game, caduceus, 0, { targets: [ref(giant)] });
    lands(game, "Mountain", 1);
    cast(game, toHand(game, "Lightning Bolt"), { targets: [ref(giant)] });
    expect(damage(game, giant)).toBe(0);
  });

  it("one that loses its abilities after it's equipped loses the prevention too", () => {
    const { game, giant } = equipped(30);
    game.debugApplyEffect(B, { kind: "lose-abilities", target: 0, duration: "end-of-turn" }, [ref(giant)]);
    lands(game, "Mountain", 1);
    cast(game, toHand(game, "Lightning Bolt"), { targets: [ref(giant)] });
    expect(damage(game, giant)).toBe(3);
  });

  it("its ruling: combat damage that lifelinks you to 30 isn't prevented, but indestructible saves it", () => {
    const { game, a, b, giant } = equipped(28);
    const ogre = spawn(game, "Hill Giant", B);
    b.declareBlockersFn = () => [{ blocker: ogre, attacker: giant }];
    attack(game, a, [giant]);
    expect(life(game, A)).toBe(31);
    expect(zone(game, giant)).toBe("battlefield");
    expect(damage(game, giant)).toBe(3);
  });
});
